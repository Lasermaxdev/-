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

// إنشاء اتصال بقاعدة البيانات
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'printer_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// التحقق من التوكن
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key',
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'توكن غير صالح' });
      }
      req.user = user;
      next();
    }
  );
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
        return res
          .status(403)
          .json({ error: 'ليس لديك صلاحية لهذا الإجراء' });
      }

      next();
    } catch (err) {
      console.error('خطأ في التحقق من الصلاحيات:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  };
};

// مسار تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const [permissions] = await pool.query(
      `SELECT p.name 
       FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    delete user.password;

    res.json({
      token,
      user,
      permissions: permissions.map((p) => p.name),
    });
  } catch (err) {
    console.error('خطأ في تسجيل الدخول:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// المستخدمين
app.get(
  '/api/users',
  authenticateToken,
  checkPermission('users:view'),
  async (req, res) => {
    try {
      const [users] = await pool.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         ORDER BY u.created_at DESC`
      );

      users.forEach((user) => delete user.password);
      res.json(users);
    } catch (err) {
      console.error('خطأ في جلب المستخدمين:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

app.post(
  '/api/users',
  authenticateToken,
  checkPermission('users:create'),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
        department,
        phone,
        startDate,
        jobTitle,
        company,
        address,
      } = req.body;

      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res
          .status(400)
          .json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
      }

      const [roles] = await pool.query(
        'SELECT id FROM roles WHERE name = ?',
        [role]
      );

      if (roles.length === 0) {
        return res.status(400).json({ error: 'الدور غير موجود' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO users (
          id, name, email, password, role_id, department,
          phone, start_date, job_title, company, address,
          created_at, updated_at
        ) VALUES (
          UUID(), ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )`,
        [
          name,
          email,
          hashedPassword,
          roles[0].id,
          department,
          phone,
          startDate,
          jobTitle,
          company,
          address,
        ]
      );

      res.status(201).json({
        message: 'تم إنشاء المستخدم بنجاح',
        userId: result.insertId,
      });
    } catch (err) {
      console.error('خطأ في إنشاء المستخدم:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// تحديث بيانات المستخدم
app.put(
  '/api/users/:id',
  authenticateToken,
  checkPermission('users:edit'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // التحقق من وجود المستخدم
      const [existingUser] = await pool.query(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }

      // التحقق من البريد الإلكتروني إذا تم تغييره
      if (updates.email) {
        const [emailCheck] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [updates.email, id]
        );

        if (emailCheck.length > 0) {
          return res
            .status(400)
            .json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
        }
      }

      // تشفير كلمة المرور الجديدة إذا تم تحديثها
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      // تحديث بيانات المستخدم
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id') {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      updateValues.push(id); // إضافة معرف المستخدم للشرط WHERE

      if (updateFields.length > 0) {
        await pool.query(
          `UPDATE users 
           SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          updateValues
        );
      }

      res.json({ message: 'تم تحديث بيانات المستخدم بنجاح' });
    } catch (err) {
      console.error('خطأ في تحديث المستخدم:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// حذف المستخدم
app.delete(
  '/api/users/:id',
  authenticateToken,
  checkPermission('users:delete'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // التحقق من وجود المستخدم
      const [existingUser] = await pool.query(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }

      // حذف السجلات المرتبطة أولاً
      await pool.query('START TRANSACTION');

      try {
        // حذف طلبات الصيانة المرتبطة
        await pool.query(
          'DELETE FROM maintenance_requests WHERE client_id = ? OR technician_id = ?',
          [id, id]
        );

        // حذف المبيعات المرتبطة
        await pool.query('DELETE FROM sales WHERE client_id = ?', [id]);

        // حذف المستخدم
        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        await pool.query('COMMIT');
        res.json({ message: 'تم حذف المستخدم بنجاح' });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (err) {
      console.error('خطأ في حذف المستخدم:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// الطابعات
app.get(
  '/api/printers',
  authenticateToken,
  checkPermission('printers:view'),
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

app.post(
  '/api/printers',
  authenticateToken,
  checkPermission('printers:create'),
  async (req, res) => {
    try {
      const printer = { ...req.body, id: uuidv4() };

      if (!printer.model || !printer.serialNumber || !printer.type) {
        return res.status(400).json({
          error: 'البيانات غير مكتملة',
          message: 'يجب توفير موديل الطابعة والرقم التسلسلي والنوع',
        });
      }

      await pool.query('INSERT INTO printers SET ?', printer);
      res.status(201).json(printer);
    } catch (err) {
      console.error('خطأ في إضافة الطابعة:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// تحديث الطابعة
app.put(
  '/api/printers/:id',
  authenticateToken,
  checkPermission('printers:edit'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // التحقق من وجود الطابعة
      const [existingPrinter] = await pool.query(
        'SELECT * FROM printers WHERE id = ?',
        [id]
      );

      if (existingPrinter.length === 0) {
        return res.status(404).json({ error: 'الطابعة غير موجودة' });
      }

      // التحقق من عدم تكرار الرقم التسلسلي
      if (updates.serialNumber) {
        const [duplicateCheck] = await pool.query(
          'SELECT id FROM printers WHERE serialNumber = ? AND id != ?',
          [updates.serialNumber, id]
        );

        if (duplicateCheck.length > 0) {
          return res.status(400).json({ error: 'الرقم التسلسلي مستخدم بالفعل' });
        }
      }

      // تحديث بيانات الطابعة
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id') {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      updateValues.push(id);

      if (updateFields.length > 0) {
        await pool.query(
          `UPDATE printers 
           SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          updateValues
        );
      }

      res.json({ message: 'تم تحديث بيانات الطابعة بنجاح' });
    } catch (err) {
      console.error('خطأ في تحديث الطابعة:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// حذف الطابعة
app.delete(
  '/api/printers/:id',
  authenticateToken,
  checkPermission('printers:delete'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // التحقق من وجود الطابعة
      const [existingPrinter] = await pool.query(
        'SELECT * FROM printers WHERE id = ?',
        [id]
      );

      if (existingPrinter.length === 0) {
        return res.status(404).json({ error: 'الطابعة غير موجودة' });
      }

      // حذف الطابعة مباشرة
      await pool.query('DELETE FROM printers WHERE id = ?', [id]);
      
      res.json({ message: 'تم حذف الطابعة بنجاح' });
    } catch (err) {
      console.error('خطأ في حذف الطابعة:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// المبيعات
app.get(
  '/api/sales',
  authenticateToken,
  checkPermission('sales:view'),
  async (req, res) => {
    try {
      const [sales] = await pool.query(`
        SELECT s.*, p.model as printer_model, u.name as client_name
        FROM sales s
        LEFT JOIN printers p ON s.printer_id = p.id
        LEFT JOIN users u ON s.client_id = u.id
        ORDER BY s.created_at DESC
      `);
      res.json(sales);
    } catch (err) {
      console.error('خطأ في جلب المبيعات:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

app.post(
  '/api/sales',
  authenticateToken,
  checkPermission('sales:create'),
  async (req, res) => {
    try {
      const sale = { ...req.body, id: uuidv4() };

      if (!sale.printer_id || !sale.client_id || !sale.amount) {
        return res.status(400).json({
          error: 'البيانات غير مكتملة',
          message: 'يجب توفير معرف الطابعة والعميل والمبلغ',
        });
      }

      await pool.query('INSERT INTO sales SET ?', sale);
      res.status(201).json(sale);
    } catch (err) {
      console.error('خطأ في إضافة عملية البيع:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// طلبات الصيانة
app.get(
  '/api/maintenance',
  authenticateToken,
  checkPermission('maintenance:view'),
  async (req, res) => {
    try {
      const [requests] = await pool.query(`
        SELECT mr.*, p.model as printer_model, u.name as client_name
        FROM maintenance_requests mr
        LEFT JOIN printers p ON mr.printer_id = p.id
        LEFT JOIN users u ON mr.client_id = u.id
        ORDER BY mr.created_at DESC
      `);
      res.json(requests);
    } catch (err) {
      console.error('خطأ في جلب طلبات الصيانة:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

app.post(
  '/api/maintenance',
  authenticateToken,
  checkPermission('maintenance:create'),
  async (req, res) => {
    try {
      const request = { ...req.body, id: uuidv4() };

      if (!request.printer_id || !request.client_id || !request.issue) {
        return res.status(400).json({
          error: 'البيانات غير مكتملة',
          message: 'يجب توفير معرف الطابعة والعميل والمشكلة',
        });
      }

      await pool.query('INSERT INTO maintenance_requests SET ?', request);
      res.status(201).json(request);
    } catch (err) {
      console.error('خطأ في إضافة طلب الصيانة:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// المخزون
app.get(
  '/api/inventory',
  authenticateToken,
  checkPermission('inventory:view'),
  async (req, res) => {
    try {
      const [items] = await pool.query(
        'SELECT * FROM inventory ORDER BY created_at DESC'
      );
      res.json(items);
    } catch (err) {
      console.error('خطأ في جلب المخزون:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

app.post(
  '/api/inventory',
  authenticateToken,
  checkPermission('inventory:create'),
  async (req, res) => {
    try {
      const item = { ...req.body, id: uuidv4() };

      if (!item.name || !item.sku || !item.category) {
        return res.status(400).json({
          error: 'البيانات غير مكتملة',
          message: 'يجب توفير اسم الصنف ورقمه وفئته',
        });
      }

      await pool.query('INSERT INTO inventory SET ?', item);
      res.status(201).json(item);
    } catch (err) {
      console.error('خطأ في إضافة الصنف:', err);
      res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
  }
);

// مسارات الصلاحيات
app.get('/api/permissions', authenticateToken, async (req, res) => {
  try {
    const [permissions] = await pool.query(`
      SELECT p.*,
             CASE
               WHEN p.name LIKE 'users:%' THEN 'users'
               WHEN p.name LIKE 'printers:%' THEN 'printers'
               WHEN p.name LIKE 'sales:%' THEN 'sales'
               WHEN p.name LIKE 'maintenance:%' THEN 'maintenance'
               WHEN p.name LIKE 'inventory:%' THEN 'inventory'
               WHEN p.name LIKE 'reports:%' THEN 'reports'
               WHEN p.name LIKE 'settings:%' THEN 'settings'
               ELSE 'other'
             END as category
      FROM permissions p
      ORDER BY p.name
    `);
    res.json(permissions);
  } catch (err) {
    console.error('خطأ في جلب الصلاحيات:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

app.get('/api/permissions/user/:userId', authenticateToken, async (req, res) => {
  try {
    const [permissions] = await pool.query(
      `
      SELECT p.* 
      FROM permissions p 
      JOIN role_permissions rp ON p.id = rp.permission_id 
      JOIN users u ON u.role_id = rp.role_id 
      WHERE u.id = ?
    `,
      [req.params.userId]
    );

    res.json({ permissions });
  } catch (err) {
    console.error('خطأ في جلب صلاحيات المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

app.put('/api/permissions/user/:userId', authenticateToken, async (req, res) => {
  const { permissions } = req.body;
  const { userId } = req.params;

  try {
    await pool.query('START TRANSACTION');

    // الحصول على معرف دور المستخدم
    const [users] = await pool.query('SELECT role_id FROM users WHERE id = ?', [
      userId,
    ]);
    if (users.length === 0) {
      throw new Error('المستخدم غير موجود');
    }
    const roleId = users[0].role_id;

    // حذف الصلاحيات الحالية
    await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    // إضافة الصلاحيات الجديدة
    for (const permissionId of permissions) {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleId, permissionId]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'تم تحديث الصلاحيات بنجاح' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('خطأ في تحديث الصلاحيات:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});