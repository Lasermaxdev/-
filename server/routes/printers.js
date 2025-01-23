import express from 'express';
import { PrinterSNMPService } from '../services/PrinterSNMPService.js';

const router = express.Router();
const printerService = new PrinterSNMPService();

router.get('/scan', async (req, res) => {
  try {
    // استدعاء برنامج المسح المحلي للبحث عن الطابعات
    const printerData = await printerService.scanNetwork();
    
    res.json({
      timestamp: new Date().toISOString(),
      data: printerData,
      status: 'success'
    });

  } catch (error) {
    console.error('Error scanning printer:', error);
    res.status(500).json({
      error: 'فشل في البحث عن الطابعات',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;