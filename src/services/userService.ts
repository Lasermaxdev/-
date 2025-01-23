import { dbOperations } from '../config/database';
import { User } from '../types';

export const userService = {
  async updateUser(id: string, userData: Partial<User>): Promise<void> {
    try {
      await dbOperations.query(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('فشل في تحديث بيانات المستخدم');
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await dbOperations.query(`/users/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('فشل في حذف المستخدم');
    }
  }
};