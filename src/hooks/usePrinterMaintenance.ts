import { useState, useEffect } from 'react';
import { MaintenanceRequest } from '../types';
import { dbQueries } from '../services/database';

export function usePrinterMaintenance(printerId: string) {
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    lastMaintenanceDate: null as string | null,
    nextScheduledMaintenance: null as string | null
  });

  useEffect(() => {
    const fetchMaintenanceHistory = async () => {
      if (!printerId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const history = await dbQueries.getPrinterMaintenanceHistory(printerId);
        setMaintenanceHistory(history);

        if (history.length > 0) {
          const firstRecord = history[0];
          setStats({
            totalRequests: history.length,
            completedRequests: firstRecord.stats.completed_count,
            totalCost: firstRecord.stats.total_cost,
            averageResponseTime: firstRecord.stats.avg_response_time,
            lastMaintenanceDate: history.find(r => r.status === 'completed')?.completion_date || null,
            nextScheduledMaintenance: history.find(r => r.status === 'pending')?.scheduled_date || null
          });
        }
      } catch (err) {
        console.error('Error fetching maintenance history:', err);
        setError('فشل في تحميل سجل الصيانة');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceHistory();
  }, [printerId]);

  return { maintenanceHistory, stats, isLoading, error };
}