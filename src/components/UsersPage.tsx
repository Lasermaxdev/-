import React, { useState } from 'react';
import { User2, UserPlus, Search, Edit2, Trash2, BarChart2, Mail, Phone, Calendar, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Department } from '../types';
import { AddUserForm } from './AddUserForm';
import { EditUserForm } from './EditUserForm';
import { DeleteUserDialog } from './DeleteUserDialog';
import { useUsers } from '../hooks/useDatabase';
import { userService } from '../services/userService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const roleLabels = {
  admin: 'مدير عام',
  manager: 'مدير قسم',
  employee: 'موظف',
  client: 'عميل'
};

const departmentLabels: Record<Department, string> = {
  sales: 'المبيعات',
  accounting: 'المحاسبة',
  maintenance: 'الصيانة',
  warehouse: 'المخزن'
};

const departmentColors = {
  sales: 'from-blue-500 to-blue-600',
  accounting: 'from-green-500 to-green-600',
  maintenance: 'from-yellow-500 to-yellow-600',
  warehouse: 'from-purple-500 to-purple-600'
};

export function UsersPage() {
  const { users, isLoading, error, addUser, reloadUsers } = useUsers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddUser = async (userData: Partial<User>) => {
    const success = await addUser(userData);
    if (success) {
      setShowAddForm(false);
      setStatusMessage({ type: 'success', text: 'تم إضافة المستخدم بنجاح' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleEditUser = async (userData: Partial<User>) => {
    try {
      if (!editingUser) return;
      await userService.updateUser(editingUser.id, userData);
      await reloadUsers();
      setEditingUser(null);
      setStatusMessage({ type: 'success', text: 'تم تحديث بيانات المستخدم بنجاح' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث المستخدم' });
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!deletingUser) return;
      await userService.deleteUser(deletingUser.id);
      await reloadUsers();
      setDeletingUser(null);
      setStatusMessage({ type: 'success', text: 'تم حذف المستخدم بنجاح' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ أثناء حذف المستخدم' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={reloadUsers} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
        >
          <UserPlus size={20} />
          <span>إضافة مستخدم</span>
        </motion.button>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-lg ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {statusMessage.text}
        </motion.div>
      )}

      {showAddForm && (
        <AddUserForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddUser}
        />
      )}

      {editingUser && (
        <EditUserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUser}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          userName={deletingUser.name}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
        />
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value as Department | '')}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">جميع الأقسام</option>
          {Object.entries(departmentLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المستخدم</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">معلومات الاتصال</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">القسم</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الدور</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ البدء</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                          departmentColors[user.department || 'sales']
                        } flex items-center justify-center`}>
                          <span className="text-white font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            آخر نشاط: {new Date(user.lastActive || '').toLocaleString('ar-SA')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={16} />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={16} />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-400" />
                        <span className="text-gray-900">
                          {user.department ? departmentLabels[user.department] : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role_name === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role_name === 'manager' ? 'bg-blue-100 text-blue-800' :
                          user.role_name === 'client' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {roleLabels[user.role_name]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        {user.startDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeletingUser(user)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}