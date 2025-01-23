import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// جلب جميع طلبات الصيانة
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        mr.*,
        p.model as printer_model,
        p.serial_number as printer_serial_number,
        c.name as client_name,
        c.company as client_company,
        t.name as technician_name
      FROM maintenance_requests mr
      LEFT JOIN printers p ON mr.printer_id = p.id
      LEFT JOIN users c ON mr.client_id = c.id
      LEFT JOIN users t ON mr.technician_id = t.id
      ORDER BY mr.created_at DESC
    `);
    
    const formattedRequests = rows.map(row => ({
      id: row.id,
      printer_id: row.printer_id,
      client_id: row.client_id,
      technician_id: row.technician_id,
      issue: row.issue,
      priority: row.priority,
      status: row.status,
      scheduled_date: row.scheduled_date,
      completion_date: row.completion_date,
      diagnosis: row.diagnosis,
      solution: row.solution,
      parts_used: row.parts_used,
      cost: row.cost,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
      printer: {
        model: row.printer_model,
        serial_number: row.printer_serial_number
      },
      client: {
        name: row.client_name,
        company: row.client_company
      },
      technician: row.technician_name ? {
        name: row.technician_name
      } : null
    }));

    res.json(formattedRequests);
  } catch (err) {
    console.error('Error getting maintenance requests:', err);
    res.status(500).json({ error: 'فشل في تحميل طلبات الصيانة' });
  }
});

router.post('/requests', authenticateToken, async (req, res) => {
  try {
    const {
      printer_id,
      client_id,
      issue,
      priority,
      scheduled_date,
      description
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO maintenance_requests (
        printer_id, client_id, issue, priority, status, 
        scheduled_date, description
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `, [printer_id, client_id, issue, priority, scheduled_date, description]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating maintenance request:', err);
    res.status(500).json({ error: 'فشل في إنشاء طلب الصيانة' });
  }
});


// إضافة طلب صيانة جديد
router.post('/requests', authenticateToken, async (req, res) => {
  try {
    const {
      printer_id,
      client_id,
      issue,
      priority,
      scheduled_date,
      description
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO maintenance_requests (
        printer_id,
        client_id,
        issue,
        priority,
        status,
        scheduled_date,
        description,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())
    `, [printer_id, client_id, issue, priority, scheduled_date, description]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating maintenance request:', err);
    res.status(500).json({ error: 'فشل في إضافة طلب الصيانة' });
  }
});

// تحديث طلب صيانة
router.put('/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'technician_id',
      'status',
      'scheduled_date',
      'completion_date',
      'diagnosis',
      'solution',
      'parts_used',
      'cost',
      'description'
    ];

    const updateFields = [];
    const updateValues = [];
    
    // بناء استعلام التحديث ديناميكياً
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(key === 'parts_used' ? JSON.stringify(value) : value);
      }
    }

    updateValues.push(id);

    if (updateFields.length > 0) {
      await pool.query(
        `UPDATE maintenance_requests 
         SET ${updateFields.join(', ')}, updated_at = NOW()
         WHERE id = ?`,
        updateValues
      );
    }

    res.json({ message: 'تم تحديث الطلب بنجاح' });
  } catch (err) {
    console.error('Error updating maintenance request:', err);
    res.status(500).json({ error: 'فشل في تحديث طلب الصيانة' });
  }
});

// جلب الفنيين المتاحين
router.get('/technicians', authenticateToken, async (req, res) => {
  try {
    const [technicians] = await pool.query(`
      SELECT id, name
      FROM users
      WHERE role_id = (SELECT id FROM roles WHERE name = 'technician')
      ORDER BY name
    `);
    
    res.json(technicians);
  } catch (err) {
    console.error('Error getting technicians:', err);
    res.status(500).json({ error: 'فشل في تحميل قائمة الفنيين' });
  }
});

export default router;