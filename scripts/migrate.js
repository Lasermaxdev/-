import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // إنشاء قاعدة البيانات
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    // جدول الأدوار (roles)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول الصلاحيات (permissions)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_permission_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول المستخدمين (users)
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
        FOREIGN KEY (role_id) REFERENCES roles(id),
        INDEX idx_email (email),
        INDEX idx_role (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول العلاقة بين الأدوار والصلاحيات (role_permissions)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id VARCHAR(36),
        permission_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول الطابعات (printers)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS printers (
        id VARCHAR(36) PRIMARY KEY,
        model VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100) NOT NULL UNIQUE,
        type ENUM('color', 'bw') NOT NULL,
        status ENUM('available', 'rented', 'maintenance', 'sold') NOT NULL DEFAULT 'available',
        printer_condition ENUM('new', 'used', 'refurbished') NOT NULL,
        brand VARCHAR(100) NOT NULL,
        purchase_date DATE,
        warranty_end DATE,
        location VARCHAR(100),
        counter_black BIGINT DEFAULT 0,
        counter_color BIGINT DEFAULT 0,
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_serial (serial_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول المبيعات (sales)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('sale', 'rental') NOT NULL,
        printer_id VARCHAR(36) NOT NULL,
        client_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('cash', 'card', 'transfer') NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        rental_start_date DATE,
        rental_end_date DATE,
        rental_period INT,
        invoice_number VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (printer_id) REFERENCES printers(id),
        FOREIGN KEY (client_id) REFERENCES users(id),
        INDEX idx_type (type),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول طلبات الصيانة (maintenance_requests)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id VARCHAR(36) PRIMARY KEY,
        printer_id VARCHAR(36) NOT NULL,
        client_id VARCHAR(36) NOT NULL,
        technician_id VARCHAR(36),
        issue TEXT NOT NULL,
        priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        scheduled_date DATE,
        completion_date DATE,
        diagnosis TEXT,
        solution TEXT,
        parts_used TEXT,
        cost DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (printer_id) REFERENCES printers(id),
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (technician_id) REFERENCES users(id),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // جدول المخزون (inventory)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        sku VARCHAR(50) NOT NULL UNIQUE,
        category ENUM('ink', 'spare', 'paper') NOT NULL,
        brand VARCHAR(100),
        model_compatibility TEXT,
        quantity INT NOT NULL DEFAULT 0,
        min_quantity INT NOT NULL DEFAULT 0,
        cost_price DECIMAL(10, 2),
        selling_price DECIMAL(10, 2),
        location VARCHAR(100),
        supplier VARCHAR(100),
        last_restock_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sku (sku),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('تم إنشاء قاعدة البيانات والجداول بنجاح');
    await connection.end();
  } catch (error) {
    console.error('خطأ في إنشاء قاعدة البيانات:', error);
    process.exit(1);
  }
}

migrate();