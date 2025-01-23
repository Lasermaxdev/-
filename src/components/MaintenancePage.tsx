import React, { useState } from 'react';
import { Wrench, Calendar, Search, Plus, CheckCircle2, XCircle, BarChart2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddMaintenanceForm } from './AddMaintenanceForm';
import { useMaintenanceRequests } from '../hooks/useDatabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const statusLabels = {
  pending: 'قيد الانتظار',
  in_progress: 'جاري العمل',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'from-green-500 to-green-600',
  normal: 'from-blue-500 to-blue-600',
  high: 'from-yellow-500 to-yellow-600',
  urgent: 'from-red-500 to-red-600'
};

export function MaintenancePage() {
  const { requests, isLoading, error, addRequest, reloadRequests } = useMaintenanceRequests();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleAddRequest = async (requestData: any) => {
    const success = await addRequest(requestData);
    if (success) {
      setShowAddForm(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.printer_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { 
      title: 'طلبات قيد الانتظار', 
      value: requests.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      title: 'صيانة اليوم', 
      value: requests.filter(r => {
        const today = new Date().toISOString().split('T')[0];
        return r.scheduled_date === today && r.status === 'in_progress';
      }).length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'مكتملة هذا الأسبوع', 
      value: requests.filter(r => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return r.status === 'completed' && new Date(r.completion_date) > weekAgo;
      }).length,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600'
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={reloadRequests} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الصيانة</h1>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          <span>طلب صيانة جديد</span>
        </motion.button>
      </div>

      {showAddForm && (
        <AddMaintenanceForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddRequest}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className={`bg-gradient-to-br ${stat.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="bg-white/20 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <BarChart2 className="h-6 w-6 text-white/70" />
              </div>
              <div className="mt-4 text-white">
                <p className="text-sm font-medium text-white/80">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث في طلبات الصيانة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الطابعة</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المشكلة</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredRequests.map((request) => (
                  <motion.tr
                    key={request.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${priorityColors[request.priority]} flex items-center justify-center`}>
                          <Wrench className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{request.printer_model}</div>
                          <div className="text-sm text-gray-500">{request.serial_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{request.client_name}</td>
                    <td className="px-6 py-4 text-gray-900">{request.issue}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-green-600 hover:text-green-800"
                          title="إكمال الطلب"
                          disabled={request.status === 'completed' || request.status === 'cancelled'}
                        >
                          <CheckCircle2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-600 hover:text-red-800"
                          title="إلغاء الطلب"
                          disabled={request.status === 'completed' || request.status === 'cancelled'}
                        >
                          <XCircle size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}