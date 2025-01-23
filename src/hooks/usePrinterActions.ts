import { useState } from 'react';
import { printerService } from '../services/printerService';
import { Printer } from '../types';

export function usePrinterActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrinter = async (id: string, updates: Partial<Printer>) => {
    setIsLoading(true);
    setError(null);
    try {
      await printerService.updatePrinter(id, updates);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الطابعة');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrinter = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await printerService.deletePrinter(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف الطابعة';
      setError(errorMessage);
      throw new Error(errorMessage); // رمي الخطأ ليتم التقاطه في المكون
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await printerService.updatePrinterStatus(id, status);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الحالة');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePrinter,
    deletePrinter,
    updateStatus,
    isLoading,
    error
  };
}