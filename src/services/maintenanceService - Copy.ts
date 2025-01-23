import { dbOperations } from '../config/database';
import { MaintenanceRequest } from '../types';

export const maintenanceService = {
  async createMaintenanceRequest(requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    try {
      const response = await dbOperations.query('/maintenance', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      return response;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw new Error('فشل في إنشاء طلب الصيانة');
    }
  },

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<void> {
    try {
      await dbOperations.query(`/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw new Error('فشل في تحديث طلب الصيانة');
    }
  },

  async completeMaintenanceRequest(id: string, completionData: {
    diagnosis: string;
    solution: string;
    cost: number;
    parts?: Array<{
      partId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<void> {
    try {
      await dbOperations.query(`/maintenance/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify({
          ...completionData,
          status: 'completed',
          completionDate: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error completing maintenance request:', error);
      throw new Error('فشل في إكمال طلب الصيانة');
    }
  },

  async cancelMaintenanceRequest(id: string, reason: string): Promise<void> {
    try {
      await dbOperations.query(`/maintenance/${id}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: reason
        })
      });
    } catch (error) {
      console.error('Error canceling maintenance request:', error);
      throw new Error('فشل في إلغاء طلب الصيانة');
    }
  },

  async assignTechnician(requestId: string, technicianId: string): Promise<void> {
    try {
      await dbOperations.query(`/maintenance/${requestId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({
          technicianId,
          status: 'in_progress'
        })
      });
    } catch (error) {
      console.error('Error assigning technician:', error);
      throw new Error('فشل في تعيين الفني');
    }
  }
};