import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixUsersTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // حذف الجدول القديم إذا كان موجوداً
    await connection.query('DROP TABLE IF EXISTS users');

    // إنشاء جدول المستخدمين من جديد
    await connection.query(`
      CREATE TABLE users (
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

    console.log('تم إصلاح جدول المستخدمين بنجاح');
    await connection.end();
  } catch (error) {
    console.error('خطأ في إصلاح جدول المستخدمين:', error);
    process.exit(1);
  }
}

fixUsersTable();