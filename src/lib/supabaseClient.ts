import { dbOperations } from '../config/database';

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch('http://172.16.16.246:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل تسجيل الدخول');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('user_permissions', JSON.stringify(data.permissions));

        // تحديث حالة الاتصال عند تسجيل الدخول
        await this.updateUserStatus();
        this.startStatusUpdates();

        return data.user;
      }
      
      throw new Error('فشل تسجيل الدخول');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout() {
    this.stopStatusUpdates();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('status_interval');
  },

  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  getAuthToken() {
    return localStorage.getItem('auth_token');
  },

  hasPermission(permission: string): boolean {
    const permissions = localStorage.getItem('user_permissions');
    if (!permissions) return false;
    return JSON.parse(permissions).includes(permission);
  },

  async updateUserStatus() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://172.16.16.246:8080/api/auth/ping', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث حالة الاتصال');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  },

  startStatusUpdates() {
    // تحديث الحالة كل 30 ثانية
    const intervalId = setInterval(() => {
      this.updateUserStatus();
    }, 30000);

    // تخزين معرف الفاصل الزمني للإيقاف لاحقاً
    localStorage.setItem('status_interval', intervalId.toString());
  },

  stopStatusUpdates() {
    const intervalId = localStorage.getItem('status_interval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem('status_interval');
    }
  }
};