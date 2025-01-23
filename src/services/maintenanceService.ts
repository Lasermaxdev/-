import { dbOperations } from '../config/database';
import { MaintenanceRequest } from '../types';

export const maintenanceService = {
  async createMaintenanceRequest(requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء طلب الصيانة');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw error;
    }
  },

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<void> {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث طلب الصيانة');
      }
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw error;
    }
  },

  async assignTechnician(requestId: string, technicianId: string): Promise<void> {
    try {
      const response = await fetch(`/api/maintenance/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          technician_id: technicianId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('فشل في تعيين الفني');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      throw error;
    }
  }
};