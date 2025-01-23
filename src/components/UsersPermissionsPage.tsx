import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, User2 } from 'lucide-react';
import { useUsers } from '../hooks/useDatabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { PermissionsManager } from './PermissionsManager';

const roleLabels = {
  admin: 'مدير النظام',
  manager: 'مدير قسم',
  employee: 'موظف',
  client: 'عميل'
};

export function UsersPermissionsPage() {
  const { users, isLoading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة صلاحيات المستخدمين</h1>
          <p className="text-gray-500 mt-1">قم بإدارة وتخصيص صلاحيات المستخدمين في النظام</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200">
          {/* Users List */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="بحث عن مستخدم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">جميع الأدوار</option>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border ${
                    selectedUser === user.id 
                      ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/10'
                  } cursor-pointer transition-all`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${
                      user.role === 'admin' ? 'from-purple-500 to-purple-600' :
                      user.role === 'manager' ? 'from-blue-500 to-blue-600' :
                      user.role === 'employee' ? 'from-green-500 to-green-600' :
                      'from-gray-500 to-gray-600'
                    } flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <span className={`mr-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'employee' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {roleLabels[user.role]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Permissions Manager */}
          <div className="p-6">
            {selectedUser ? (
              <PermissionsManager userId={selectedUser} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>اختر مستخدماً لإدارة صلاحياته</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}