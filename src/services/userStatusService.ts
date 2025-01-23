import { dbOperations } from '../config/database';

export const userStatusService = {
  async updateUserStatus(userId: string): Promise<void> {
    try {
      await dbOperations.query(`/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({
          last_ping: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async getUserStatus(userId: string) {
    try {
      const response = await dbOperations.query(`/users/${userId}/status`);
      return response;
    } catch (error) {
      console.error('Error getting user status:', error);
      throw error;
    }
  },

  startStatusTracking(userId: string) {
    // Send ping every 30 seconds
    const intervalId = setInterval(() => {
      this.updateUserStatus(userId);
    }, 30000);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(intervalId);
      } else {
        this.updateUserStatus(userId);
        this.startStatusTracking(userId);
      }
    });

    // Handle beforeunload event
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
    });

    return intervalId;
  },

  stopStatusTracking(intervalId: number) {
    clearInterval(intervalId);
  }
};