import { useState, useEffect } from 'react';
import { userStatusService } from '../services/userStatusService';

export function useUserStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number;

    const startTracking = async () => {
      try {
        // Start sending status updates
        intervalId = userStatusService.startStatusTracking(userId);

        // Get initial status
        const status = await userStatusService.getUserStatus(userId);
        setIsOnline(status.is_online);
        setLastSeen(status.last_ping);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error tracking user status');
      }
    };

    startTracking();

    return () => {
      if (intervalId) {
        userStatusService.stopStatusTracking(intervalId);
      }
    };
  }, [userId]);

  return { isOnline, lastSeen, error };
}