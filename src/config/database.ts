// src/config/database.ts
const API_URL = process.env.VITE_API_URL || 'http://172.16.16.246:8080/api';

export const dbOperations = {
  async query(endpoint: string, options: RequestInit = {}) {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
};
