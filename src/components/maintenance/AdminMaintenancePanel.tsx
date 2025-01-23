import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Filter, Search, ArrowUpDown, 
  Calendar, Clock, AlertTriangle, CheckCircle2,
  BarChart2, PieChart, TrendingUp, UserCheck
} from 'lucide-react';
import { useMaintenanceRequests, useUsers } from '../../hooks/useDatabase';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { maintenanceService } from '../../services/maintenanceService';

export function AdminMaintenancePanel() {
  const { requests, isLoading: requestsLoading, error: requestsError, reloadRequests } = useMaintenanceRequests();
  const { users: technicians, isLoading: techLoading, error: techError } = useUsers();
  
  const [filteredRequests, setFilteredRequests] = useState(requests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // فلترة الفنيين
  const availableTechnicians = technicians.filter(user => 
    user.role_name === 'employee' && user.department === 'maintenance'
  );

  // إحصائيات
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    urgent: requests.filter(r => r.priority === 'urgent').length
  };

  // تحديث الفلتر
  useEffect(() => {
    let filtered = [...requests];

    // البحث
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.printer_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.issue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلتر الحالة
    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // فلتر الأولوية
    if (priorityFilter) {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // الترتيب
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      }
      return a[sortField] < b[sortField] ? 1 : -1;
    });

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, priorityFilter, sortField, sortOrder]);

  const handleAssignTechnician = async (requestId: string, technicianId: string) => {
    try {
      await maintenanceService.assignTechnician(requestId, technicianId);
      setStatusMessage({ type: 'success', text: 'تم تعيين الفني بنجاح' });
      await reloadRequests();
    } catch (error) {
      console.error('Error assigning technician:', error);
      setStatusMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'حدث خطأ أثناء تعيين الفني'
      });
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await maintenanceService.updateMaintenanceRequest(requestId, { status: newStatus });
      setStatusMessage({ type: 'success', text: 'تم تحديث حالة الطلب بنجاح' });
      await reloadRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setStatusMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الحالة'
      });
    }
  };

  if (requestsLoading || techLoading) {
    return <LoadingSpinner />;
  }

  if (requestsError || techError) {
    return <ErrorMessage 
      message={requestsError || techError} 
      onRetry={reloadRequests}
    />;
  }

  return (
    <div className="space-y-6">
      {/* رسالة الحالة */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg ${
              statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* الإحصائيات */}
      <div className="grid grid-cols-5 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart2 className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">إجمالي الطلبات</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">قيد الانتظار</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{stats.inProgress}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">قيد التنفيذ</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">مكتملة</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{stats.urgent}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">عاجلة</p>
        </motion.div>
      </div>

      {/* أدوات التحكم */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغية</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأولويات</option>
            <option value="low">عادي</option>
            <option value="normal">متوسط</option>
            <option value="high">عاجل</option>
            <option value="urgent">طارئ</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <ArrowUpDown size={18} />
            <span>{sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}</span>
          </button>
        </div>
      </div>

      {/* قائمة الطلبات */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                العميل
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الطابعة
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                المشكلة
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الأولوية
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الفني المسؤول
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredRequests.map((request) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.client_company}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.printer_model}</div>
                    <div className="text-sm text-gray-500">{request.printer_serial}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.issue}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.priority === 'urgent' ? ' bg-red-100 text-red-800' :
                      request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      request.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.priority === 'urgent' ? 'طارئ' :
                       request.priority === 'high' ? 'عاجل' :
                       request.priority === 'normal' ? 'متوسط' :
                       'عادي'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                      className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {request.technician_id ? (
                      <div className="text-sm text-gray-900">
                        {request.technician_name}
                      </div>
                    ) : (
                      <select
                        onChange={(e) => handleAssignTechnician(request.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option value="">تعيين فني</option>
                        {availableTechnicians.map(tech => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}