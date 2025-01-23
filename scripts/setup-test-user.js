import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function setupTestUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // تحديث بنية جدول المستخدمين
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id VARCHAR(36),
        department ENUM('sales', 'accounting', 'maintenance', 'warehouse'),
        phone VARCHAR(20),
        start_date DATE,
        job_title VARCHAR(100),
        company VARCHAR(100),
        address TEXT,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // الحصول على معرف دور المدير العام
    const [adminRoles] = await connection.query(
      'SELECT id FROM roles WHERE name = ?',
      ['admin']
    );

    if (adminRoles.length === 0) {
      throw new Error('لم يتم العثور على دور المدير العام');
    }

    const adminRoleId = adminRoles[0].id;

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // إضافة مستخدم تجريبي
    await connection.query(`
      INSERT INTO users (id, name, email, password, role_id, department)
      VALUES (UUID(), 'مدير النظام', 'admin@example.com', ?, ?, 'sales')
      ON DUPLICATE KEY UPDATE
      password = ?,
      role_id = ?
    `, [hashedPassword, adminRoleId, hashedPassword, adminRoleId]);

    console.log('تم إعداد المستخدم التجريبي بنجاح');
    console.log('البريد الإلكتروني: admin@example.com');
    console.log('كلمة المرور: admin123');

    await connection.end();
  } catch (error) {
    console.error('خطأ في إعداد المستخدم التجريبي:', error);
    process.exit(1);
  }
}

setupTestUser();