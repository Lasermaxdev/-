import { dbOperations } from '../config/database';
import { Printer } from '../types';

export const printerService = {
  async updatePrinter(id: string, updates: Partial<Printer>): Promise<void> {
    try {
      await dbOperations.query(`/printers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating printer:', error);
      throw new Error('فشل في تحديث بيانات الطابعة');
    }
  },

  async deletePrinter(id: string): Promise<void> {
    try {
      // التحقق من وجود عمليات بيع أو صيانة مرتبطة
      const salesResponse = await dbOperations.query(`/sales?printer_id=${id}`);
      if (salesResponse && salesResponse.length > 0) {
        throw new Error('لا يمكن حذف الطابعة لوجود عمليات بيع مرتبطة بها');
      }

      const maintenanceResponse = await dbOperations.query(`/maintenance?printer_id=${id}`);
      if (maintenanceResponse && maintenanceResponse.length > 0) {
        throw new Error('لا يمكن حذف الطابعة لوجود طلبات صيانة مرتبطة بها');
      }

      // حذف الطابعة
      const response = await dbOperations.query(`/printers/${id}`, {
        method: 'DELETE'
      });

      if (!response) {
        throw new Error('فشل في حذف الطابعة');
      }
    } catch (error) {
      console.error('Error deleting printer:', error);
      throw error instanceof Error ? error : new Error('فشل في حذف الطابعة');
    }
  },

  async updatePrinterStatus(id: string, status: string): Promise<void> {
    try {
      await this.updatePrinter(id, { status });
    } catch (error) {
      console.error('Error updating printer status:', error);
      throw new Error('فشل في تحديث حالة الطابعة');
    }
  },

  async updateMaintenanceInfo(id: string, maintenanceInfo: {
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    maintenanceNotes?: string;
  }): Promise<void> {
    try {
      await this.updatePrinter(id, maintenanceInfo);
    } catch (error) {
      console.error('Error updating maintenance info:', error);
      throw new Error('فشل في تحديث معلومات الصيانة');
    }
  }
};