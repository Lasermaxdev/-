import { useState, useEffect } from 'react';
import { dbOperations } from '../config/database';
import { MaintenanceRequest } from '../types';

export function useMaintenanceRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
  try {



      const response = await dbOperations.query('/maintenance/requests');
      
      // تحويل البيانات من قاعدة البيانات إلى الشكل المطلوب
      const formattedRequests = (response as any[]).map(row => ({
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
        parts_used: row.parts_used ? JSON.parse(row.parts_used) : [],
        cost: row.cost,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
        printer: row.printer_model ? {
          model: row.printer_model,
          serial_number: row.printer_serial_number
        } : null,
        client: row.client_name ? {
          name: row.client_name,
          company: row.client_company
        } : null,
        technician: row.technician_name ? {
          name: row.technician_name
        } : null
      }));

      setRequests(formattedRequests);
    } catch (err) {
      console.error('Error loading maintenance requests:', err);
      setError('فشل في تحميل طلبات الصيانة');
    } finally {
      setIsLoading(false);
    }
  };

const addRequest = async (requestData: Partial<MaintenanceRequest>) => {
  try {
    setIsLoading(true);
    setError(null);

    // تأكد من وجود الحقول المطلوبة
    if (!requestData.printer_id || !requestData.client_id || !requestData.issue) {
      throw new Error('الحقول المطلوبة غير مكتملة');
    }

    await dbOperations.query('/maintenance/requests', {
      method: 'POST',
      body: JSON.stringify({
        ...requestData,
        priority: requestData.priority || 'normal',
        status: 'pending'
      })
    });

    await loadRequests();
    return true;
  } catch (err) {
    console.error('Error adding maintenance request:', err);
    setError(err instanceof Error ? err.message : 'فشل في إضافة طلب الصيانة');
    return false;
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    loadRequests();
  }, []);

  return {
    requests,
    isLoading,
    error,
    addRequest,
    updateRequest,
    reloadRequests: loadRequests
  };
}