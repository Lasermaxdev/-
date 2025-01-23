import express from 'express';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// جلب جميع الصلاحيات والأدوار
router.get('/', authenticateToken, checkPermission('users:view'), async (req, res) => {
  try {
    const [permissions] = await pool.query('SELECT * FROM permissions');
    const [roles] = await pool.query('SELECT * FROM roles');
    
    res.json({ permissions, roles });
  } catch (err) {
    console.error('خطأ في جلب الصلاحيات:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// جلب صلاحيات مستخدم محدد
router.get('/users/:userId', authenticateToken, checkPermission('users:view'), async (req, res) => {
  try {
    const [permissions] = await pool.query(
      `SELECT p.* 
       FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       JOIN users u ON u.role_id = rp.role_id 
       WHERE u.id = ?`,
      [req.params.userId]
    );
    
    res.json({ permissions });
  } catch (err) {
    console.error('خطأ في جلب صلاحيات المستخدم:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// تحديث صلاحيات مستخدم
router.put('/users/:userId', authenticateToken, checkPermission('users:edit'), async (req, res) => {
  const { permissions } = req.body;
  const { userId } = req.params;

  try {
    await pool.query('START TRANSACTION');

    // حذف الصلاحيات الحالية
    await pool.query(
      'DELETE FROM role_permissions WHERE role_id = (SELECT role_id FROM users WHERE id = ?)',
      [userId]
    );

    // إضافة الصلاحيات الجديدة
    for (const permissionId of permissions) {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ((SELECT role_id FROM users WHERE id = ?), ?)',
        [userId, permissionId]
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

export default router;