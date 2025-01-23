import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addUserStatus() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // إضافة الأعمدة الجديدة
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN last_ping TIMESTAMP NULL,
      ADD COLUMN is_online BOOLEAN DEFAULT FALSE
    `);

    // إنشاء الترجر لتحديث حالة الاتصال
    await connection.query(`
      CREATE TRIGGER update_user_online_status
      BEFORE UPDATE ON users
      FOR EACH ROW
      BEGIN
        IF NEW.last_ping >= NOW() - INTERVAL 2 MINUTE THEN
          SET NEW.is_online = TRUE;
        ELSE
          SET NEW.is_online = FALSE;
        END IF;
      END
    `);

    // إضافة بيانات اختبار
    await connection.query(`
      INSERT INTO users (
        id, 
        name,
        email,
        password,
        role_id,
        department,
        phone,
        start_date,
        job_title,
        company,
        address
      ) VALUES
      (UUID(), 'مدير النظام', 'admin@example.com', SHA2('admin123', 256), 
       (SELECT id FROM roles WHERE name = 'admin'),
       'management', '0500000001', CURDATE(), 'مدير النظام',
       'شركة إدارة الطابعات', 'الرياض - شارع الملك فهد'),
      
      (UUID(), 'محمد أحمد', 'mohammed@example.com', SHA2('client123', 256),
       (SELECT id FROM roles WHERE name = 'client'),
       NULL, '0500000002', CURDATE(), 'مدير تنفيذي',
       'شركة الأمل للتجارة', 'الرياض - العليا'),
      
      (UUID(), 'سارة خالد', 'sara@example.com', SHA2('client123', 256),
       (SELECT id FROM roles WHERE name = 'client'),
       NULL, '0500000003', CURDATE(), 'مديرة المشتريات',
       'مؤسسة النور', 'جدة - شارع التحلية'),
      
      (UUID(), 'فهد عبدالله', 'fahad@example.com', SHA2('client123', 256),
       (SELECT id FROM roles WHERE name = 'client'),
       NULL, '0500000004', CURDATE(), 'مدير العمليات',
       'شركة التقنية المتطورة', 'الدمام - شارع الملك خالد'),
      
      (UUID(), 'نورة سعد', 'noura@example.com', SHA2('client123', 256),
       (SELECT id FROM roles WHERE name = 'client'),
       NULL, '0500000005', CURDATE(), 'مديرة المكتب',
       'مكتب المستقبل للمحاماة', 'الرياض - شارع العليا')
    `);

    console.log('تم إضافة حقول تتبع حالة المستخدم وبيانات الاختبار بنجاح');
    await connection.end();
  } catch (error) {
    console.error('خطأ في إضافة حقول تتبع حالة المستخدم:', error);
    process.exit(1);
  }
}

addUserStatus();