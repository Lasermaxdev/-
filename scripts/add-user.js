import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function addUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // بيانات المستخدم الجديد
    const newUser = {
      id: uuidv4(),
      name: 'محمد أحمد',
      email: 'mohammed@example.com',
      password: await bcrypt.hash('Password123', 10), // تشفير كلمة المرور
      department: 'sales',
      phone: '0500000000',
      start_date: new Date().toISOString().split('T')[0],
      job_title: 'مدير مبيعات'
    };

    // الحصول على معرف دور المدير
    const [managerRoles] = await connection.query(
      'SELECT id FROM roles WHERE name = ?',
      ['manager']
    );

    if (managerRoles.length === 0) {
      throw new Error('لم يتم العثور على دور المدير');
    }

    const managerRoleId = managerRoles[0].id;

    // إضافة المستخدم
    await connection.query(`
      INSERT INTO users (
        id, name, email, password, role_id, department, 
        phone, start_date, job_title, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password,
      managerRoleId,
      newUser.department,
      newUser.phone,
      newUser.start_date,
      newUser.job_title
    ]);

    console.log('تم إضافة المستخدم بنجاح');
    console.log('البريد الإلكتروني:', newUser.email);
    console.log('كلمة المرور: Password123');

    await connection.end();
  } catch (error) {
    console.error('خطأ في إضافة المستخدم:', error);
    process.exit(1);
  }
}

addUser();