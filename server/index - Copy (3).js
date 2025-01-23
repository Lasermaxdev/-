
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// تكوين اتصال قاعدة البيانات مع معالجة الأخطاء
const createPool = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'printer_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000, // 10 seconds
      acquireTimeout: 10000,
      timezone: '+00:00',
    });

    // اختبار الاتصال
    await pool.getConnection();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    return pool;
  } catch (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    throw new Error('فشل الاتصال بقاعدة البيانات');
  }
};

let pool;
(async () => {
  try {
    pool = await createPool();
  } catch (err) {
    console.error('فشل في إنشاء مجمع الاتصالات:', err);
    process.exit(1);
  }
})();

// دالة مساعدة للتحقق من الاتصال بقاعدة البيانات
const checkDatabaseConnection = async (req, res, next) => {
  try {
    if (!pool) {
      throw new Error('لم يتم إنشاء اتصال بقاعدة البيانات');
    }
    const connection = await pool.getConnection();
    connection.release();
    next();
  } catch (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    res.status(500).json({ 
      error: 'خطأ في الاتصال بقاعدة البيانات',
      details: err.message 
    });
  }
};

// التحقق من التوكن
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'توكن غير صالح' });
    }
    req.user = user;
    next();
  });
};

// التحقق من الصلاحيات
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const [permissions] = await pool.query(
        `SELECT p.name 
         FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         JOIN roles r ON rp.role_id = r.id 
         WHERE r.name = ?`,
        [req.user.role]
      );

      const hasPermission = permissions.some((p) => p.name === permission);

      if (!hasPermission) {
        return res.status(403).json({ error: 'ليس لديك صلاحية لهذا الإجراء' });
      }

      next();
    } catch (err) {
      console.error('خطأ في التحقق من الصلاحيات:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  };
};

// تحديث بيانات الطابعة
app.put(
  '/api/printers/:id',
  authenticateToken,
  checkPermission('printers:edit'),
  checkDatabaseConnection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      // التحقق من وجود الطابعة
      const [existingPrinter] = await pool.query(
        'SELECT * FROM printers WHERE id = ?',
        [id]
      );

      if (existingPrinter.length === 0) {
        return res.status(404).json({ error: 'الطابعة غير موجودة' });
      }

      // التحقق من الرقم التسلسلي إذا تم تغييره
      if (updates.serialNumber && updates.serialNumber !== existingPrinter[0].serialNumber) {
        const [serialCheck] = await pool.query(
          'SELECT id FROM printers WHERE serialNumber = ? AND id != ?',
          [updates.serialNumber, id]
        );

        if (serialCheck.length > 0) {
          return res.status(400).json({ error: 'الرقم التسلسلي مستخدم بالفعل' });
        }
      }

      // قائمة الكلمات المحجوزة
      const reservedWords = ['condition', 'type', 'status', 'order', 'group'];

      // تحديث بيانات الطابعة
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id') {
          // إضافة الأقواس العكسية للكلمات المحجوزة
          if (reservedWords.includes(key.toLowerCase())) {
            updateFields.push(`\`${key}\` = ?`);
          } else {
            updateFields.push(`${key} = ?`);
          }
          updateValues.push(value);
        }
      }

      // إضافة معرف الطابعة للتحديث
      updateValues.push(id);

      if (updateFields.length > 0) {
        const query = `
          UPDATE printers 
          SET ${updateFields.join(', ')}, 
              updated_at = CURRENT_TIMESTAMP,
              last_modified_by = ?
          WHERE id = ?
        `;

        // إضافة اسم المستخدم الذي قام بالتعديل
        updateValues.splice(-1, 0, req.user?.name || 'System');

        await pool.query(query, updateValues);

        // جلب البيانات المحدثة
        const [updatedPrinter] = await pool.query(
          'SELECT * FROM printers WHERE id = ?',
          [id]
        );

        res.json({
          message: 'تم تحديث بيانات الطابعة بنجاح',
          printer: updatedPrinter[0],
          updatedAt: new Date().toISOString(),
          updatedBy: req.user?.name || 'System'
        });
      } else {
        res.json({ 
          message: 'لم يتم إجراء أي تحديثات',
          printer: existingPrinter[0]
        });
      }
    } catch (err) {
      console.error('خطأ في تحديث الطابعة:', err);
      res.status(500).json({ 
        error: 'حدث خطأ في الخادم',
        details: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// جلب جميع الطابعات
app.get(
  '/api/printers',
  authenticateToken,
  checkPermission('printers:view'),
  checkDatabaseConnection,
  async (req, res) => {
    try {
      const [printers] = await pool.query(
        'SELECT * FROM printers ORDER BY created_at DESC'
      );
      res.json(printers);
    } catch (err) {
      console.error('خطأ في جلب الطابعات:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// إضافة طابعة جديدة
app.post(
  '/api/printers',
  authenticateToken,
  checkPermission('printers:create'),
  checkDatabaseConnection,
  async (req, res) => {
    try {
      const printer = {
        id: uuidv4(),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: req.user?.name || 'System'
      };

      if (!printer.model || !printer.serialNumber || !printer.type) {
        return res.status(400).json({
          error: 'البيانات غير مكتملة',
          message: 'يجب توفير موديل الطابعة والرقم التسلسلي والنوع'
        });
      }

      // التحقق من الرقم التسلسلي
      const [serialCheck] = await pool.query(
        'SELECT id FROM printers WHERE serialNumber = ?',
        [printer.serialNumber]
      );

      if (serialCheck.length > 0) {
        return res.status(400).json({ error: 'الرقم التسلسلي مستخدم بالفعل' });
      }

      const columns = Object.keys(printer);
      const values = Object.values(printer);
      const placeholders = columns.map(() => '?').join(', ');
      const columnsEscaped = columns.map(col => 
        reservedWords.includes(col.toLowerCase()) ? `\`${col}\`` : col
      ).join(', ');

      const query = `
        INSERT INTO printers (${columnsEscaped})
        VALUES (${placeholders})
      `;

      await pool.query(query, values);

      res.status(201).json({
        message: 'تم إضافة الطابعة بنجاح',
        printer: printer
      });
    } catch (err) {
      console.error('خطأ في إضافة الطابعة:', err);
      res.status(500).json({ 
        error: 'حدث خطأ في الخادم',
        details: err.message 
      });
    }
  }
);

// تشغيل الخادم
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
