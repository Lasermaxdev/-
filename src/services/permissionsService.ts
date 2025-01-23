import { dbOperations } from '../config/database';

export const permissionsService = {
  async getAllPermissions() {
    try {
      const permissions = await dbOperations.query('/permissions');
      return permissions || [];
    } catch (error) {
      console.error('Error getting permissions:', error);
      throw new Error('فشل في تحميل الصلاحيات');
    }
  },

  async getUserPermissions(userId: string) {
    try {
      const { permissions } = await dbOperations.query(`/permissions/user/${userId}`);
      return permissions || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw new Error('فشل في تحميل صلاحيات المستخدم');
    }
  },

  async updateUserPermissions(userId: string, permissions: string[]) {
    try {
      const response = await dbOperations.query(`/permissions/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ permissions })
      });
      return response;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw new Error('فشل في تحديث الصلاحيات');
    }
  }
};