import { useState } from 'react';
import { maintenanceService } from '../services/maintenanceService';
import { MaintenanceRequest } from '../types';

export function useMaintenanceActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeRequest = async (
    requestId: string,
    completionData: {
      diagnosis: string;
      solution: string;
      cost: number;
      parts?: Array<{
        partId: string;
        quantity: number;
        unitPrice: number;
      }>;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await maintenanceService.completeMaintenanceRequest(requestId, completionData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إكمال الطلب');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = async (requestId: string, reason: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await maintenanceService.cancelMaintenanceRequest(requestId, reason);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إلغاء الطلب');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const assignTechnician = async (requestId: string, technicianId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await maintenanceService.assignTechnician(requestId, technicianId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تعيين الفني');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeRequest,
    cancelRequest,
    assignTechnician,
    isLoading,
    error
  };
}