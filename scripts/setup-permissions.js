import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function setupPermissions() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // إضافة الصلاحيات
    const permissions = [
      // إدارة المستخدمين
      {
        id: uuidv4(),
        name: 'users:view',
        description: 'عرض المستخدمين'
      },
      {
        id: uuidv4(),
        name: 'users:create',
        description: 'إنشاء مستخدمين جدد'
      },
      {
        id: uuidv4(),
        name: 'users:edit',
        description: 'تعديل بيانات المستخدمين'
      },
      {
        id: uuidv4(),
        name: 'users:delete',
        description: 'حذف المستخدمين'
      },

      // إدارة الطابعات
      {
        id: uuidv4(),
        name: 'printers:view',
        description: 'عرض الطابعات'
      },
      {
        id: uuidv4(),
        name: 'printers:create',
        description: 'إضافة طابعات جديدة'
      },
      {
        id: uuidv4(),
        name: 'printers:edit',
        description: 'تعديل بيانات الطابعات'
      },
      {
        id: uuidv4(),
        name: 'printers:delete',
        description: 'حذف الطابعات'
      },

      // المبيعات
      {
        id: uuidv4(),
        name: 'sales:view',
        description: 'عرض المبيعات'
      },
      {
        id: uuidv4(),
        name: 'sales:create',
        description: 'إنشاء عملية بيع جديدة'
      },
      {
        id: uuidv4(),
        name: 'sales:edit',
        description: 'تعديل عمليات البيع'
      },
      {
        id: uuidv4(),
        name: 'sales:cancel',
        description: 'إلغاء عمليات البيع'
      },

      // الصيانة
      {
        id: uuidv4(),
        name: 'maintenance:view',
        description: 'عرض طلبات الصيانة'
      },
      {
        id: uuidv4(),
        name: 'maintenance:create',
        description: 'إنشاء طلب صيانة'
      },
      {
        id: uuidv4(),
        name: 'maintenance:edit',
        description: 'تعديل طلبات الصيانة'
      },
      {
        id: uuidv4(),
        name: 'maintenance:complete',
        description: 'إكمال طلبات الصيانة'
      },

      // المخزون
      {
        id: uuidv4(),
        name: 'inventory:view',
        description: 'عرض المخزون'
      },
      {
        id: uuidv4(),
        name: 'inventory:create',
        description: 'إضافة أصناف جديدة'
      },
      {
        id: uuidv4(),
        name: 'inventory:edit',
        description: 'تعديل المخزون'
      },
      {
        id: uuidv4(),
        name: 'inventory:delete',
        description: 'حذف أصناف من المخزون'
      }
    ];

    // إضافة الصلاحيات
    for (const permission of permissions) {
      await connection.query(
        'INSERT INTO permissions (id, name, description) VALUES (?, ?, ?)',
        [permission.id, permission.name, permission.description]
      );
    }

    console.log('تم إعداد الصلاحيات بنجاح');
    await connection.end();
  } catch (error) {
    console.error('خطأ في إعداد الصلاحيات:', error);
    process.exit(1);
  }
}

setupPermissions();