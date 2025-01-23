import pool from '../config/database';
import { User, Printer, Sale, MaintenanceRequest, InventoryItem } from '../types';

export const dbQueries = {
  // Users
  async getAllUsers(): Promise<User[]> {
    const [rows] = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id 
      ORDER BY u.created_at DESC
    `);
    return rows as User[];
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const [result] = await pool.query(
      `INSERT INTO users (id, name, email, password, role_id, department, phone, start_date, job_title, company, address)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.email,
        userData.password,
        userData.role_id,
        userData.department,
        userData.phone,
        userData.startDate,
        userData.jobTitle,
        userData.company,
        userData.address
      ]
    );
    return { ...userData, id: result.insertId } as User;
  },

  // Printers
  async getAllPrinters(): Promise<Printer[]> {
    const [rows] = await pool.query(`
      SELECT * FROM printers 
      ORDER BY created_at DESC
    `);
    return rows as Printer[];
  },

  async createPrinter(printerData: Partial<Printer>): Promise<Printer> {
    const [result] = await pool.query(
      `INSERT INTO printers (
        id, model, serial_number, type, status, condition, brand, 
        location, specifications, notes,
        ink_c, ink_m, ink_y, ink_k, ink_bw, ink_note,
        drum_c, drum_m, drum_y, drum_k, drum_bw, drum_note,
        counter_bw, counter_colored,
        purchase_date, warranty_end,
        last_maintenance_date, next_maintenance_date,
        maintenance_count, last_maintenance_notes,
        ink_history, counter_history, total_counter_history
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, 
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?
      )`,
      [
        printerData.model,
        printerData.serialNumber,
        printerData.type,
        printerData.status || 'available',
        printerData.condition,
        printerData.brand,
        printerData.location,
        printerData.specifications,
        printerData.notes,
        printerData.ink_c || 100,
        printerData.ink_m || 100,
        printerData.ink_y || 100,
        printerData.ink_k || 100,
        printerData.ink_bw || 100,
        printerData.ink_note,
        printerData.drum_c || 100,
        printerData.drum_m || 100,
        printerData.drum_y || 100,
        printerData.drum_k || 100,
        printerData.drum_bw || 100,
        printerData.drum_note,
        printerData.counter_bw || 0,
        printerData.counter_colored || 0,
        printerData.purchaseDate,
        printerData.warrantyEnd,
        null, // last_maintenance_date
        null, // next_maintenance_date
        0, // maintenance_count
        null, // last_maintenance_notes
        '[]', // ink_history
        '[]', // counter_history
        '[]' // total_counter_history
      ]
    );
    return { ...printerData, id: result.insertId } as Printer;
  },

  async updatePrinter(id: string, updates: Partial<Printer>): Promise<void> {
    const updateFields = [];
    const updateValues = [];
    
    // Build dynamic update query
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
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
  },

  // Sales
  async getAllSales(): Promise<Sale[]> {
    const [rows] = await pool.query(`
      SELECT s.*, p.model as printer_model, u.name as client_name
      FROM sales s
      JOIN printers p ON s.printer_id = p.id
      JOIN users u ON s.client_id = u.id
      ORDER BY s.created_at DESC
    `);
    return rows as Sale[];
  },

  async createSale(saleData: Partial<Sale>): Promise<Sale> {
    const [result] = await pool.query(
      `INSERT INTO sales (id, type, printer_id, client_id, amount, payment_method, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
      [
        saleData.type,
        saleData.printer_id,
        saleData.client_id,
        saleData.amount,
        saleData.payment_method,
        'pending'
      ]
    );
    return { ...saleData, id: result.insertId } as Sale;
  },

  // Maintenance
  async getAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const [rows] = await pool.query(`
      SELECT mr.*, p.model as printer_model, u.name as client_name
      FROM maintenance_requests mr
      JOIN printers p ON mr.printer_id = p.id
      JOIN users u ON mr.client_id = u.id
      ORDER BY mr.created_at DESC
    `);
    return rows as MaintenanceRequest[];
  },

  async createMaintenanceRequest(requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const [result] = await pool.query(
      `INSERT INTO maintenance_requests (
        id, printer_id, client_id, issue, priority, status, scheduled_date
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
      [
        requestData.printer_id,
        requestData.client_id,
        requestData.issue,
        requestData.priority || 'normal',
        'pending',
        requestData.scheduled_date
      ]
    );
    return { ...requestData, id: result.insertId } as MaintenanceRequest;
  },

  // Maintenance History
  async getPrinterMaintenanceHistory(printerId: string): Promise<MaintenanceRequest[]> {
    try {
      const [rows] = await pool.query(`
        SELECT 
          mr.*,
          u.name as technician_name,
          p.model as printer_model,
          c.name as client_name,
          mp.part_id,
          mp.quantity,
          mp.unit_price,
          i.name as part_name,
          i.sku as part_sku
        FROM maintenance_requests mr
        LEFT JOIN users u ON mr.technician_id = u.id
        LEFT JOIN printers p ON mr.printer_id = p.id
        LEFT JOIN users c ON mr.client_id = c.id
        LEFT JOIN maintenance_parts mp ON mr.id = mp.maintenance_id
        LEFT JOIN inventory i ON mp.part_id = i.id
        WHERE mr.printer_id = ?
        ORDER BY mr.created_at DESC
      `, [printerId]);

      // Group parts by maintenance request
      const maintenanceMap = new Map<string, any>();
      
      rows.forEach(row => {
        if (!maintenanceMap.has(row.id)) {
          maintenanceMap.set(row.id, {
            ...row,
            technician: row.technician_name ? { name: row.technician_name } : null,
            parts: []
          });
        }
        
        if (row.part_id) {
          const maintenance = maintenanceMap.get(row.id);
          maintenance.parts.push({
            part: {
              name: row.part_name,
              sku: row.part_sku
            },
            quantity: row.quantity,
            unit_price: row.unit_price
          });
        }
      });

      return Array.from(maintenanceMap.values());
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      throw new Error('فشل في جلب سجل الصيانة');
    }
  },

  // Inventory
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    return rows as InventoryItem[];
  },

  async createInventoryItem(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    const [result] = await pool.query(
      `INSERT INTO inventory (
        id, name, sku, category, brand, quantity, min_quantity, location
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemData.name,
        itemData.sku,
        itemData.category,
        itemData.brand,
        itemData.quantity || 0,
        itemData.minQuantity || 0,
        itemData.location
      ]
    );
    return { ...itemData, id: result.insertId } as InventoryItem;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    updateValues.push(id);

    if (updateFields.length > 0) {
      await pool.query(
        `UPDATE inventory 
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        updateValues
      );
    }
  }
};

export default dbQueries;