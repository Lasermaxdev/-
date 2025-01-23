import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, Users, Package, Wrench, TrendingUp, AlertCircle, 
  Bell, ArrowRight, BarChart2, Clock, Calendar, CheckCircle2 
} from 'lucide-react';
import { useUsers, usePrinters, useSales, useMaintenanceRequests, useInventory } from '../hooks/useDatabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export function Dashboard() {
  const { users, isLoading: usersLoading, error: usersError } = useUsers();
  const { printers, isLoading: printersLoading, error: printersError } = usePrinters();
  const { sales, isLoading: salesLoading, error: salesError } = useSales();
  const { requests: maintenanceRequests, isLoading: maintenanceLoading, error: maintenanceError } = useMaintenanceRequests();
  const { items: inventory, isLoading: inventoryLoading, error: inventoryError } = useInventory();

  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  const handleNavigate = (page: string) => {
    const event = new CustomEvent('pageChange', { detail: page });
    window.dispatchEvent(event);
  };

  // تحضير النشاطات الأخيرة مع مفاتيح فريدة
  const recentActivities = [
    ...sales.slice(0, 2).map(sale => ({
      id: `sale-${sale.id}`,
      title: `${sale.type === 'sale' ? 'بيع' : 'تأجير'} طابعة ${sale.printer_model}`,
      time: new Date(sale.created_at).toLocaleString('ar-SA'),
      type: sale.type,
      link: 'sales',
      details: {
        clientName: sale.client_name,
        amount: sale.amount
      }
    })),
    ...maintenanceRequests.slice(0, 2).map(req => ({
      id: `maintenance-${req.id}`,
      title: `طلب صيانة جديد #${req.id.slice(0, 8)}`,
      time: new Date(req.created_at).toLocaleString('ar-SA'),
      type: 'maintenance',
      link: 'maintenance',
      details: {
        printer: req.printer_model,
        issue: req.issue
      }
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // تحضير التنبيهات
  const alerts = [
    ...inventory
      .filter(item => item.quantity <= item.minQuantity)
      .map(item => ({
        id: `inventory-${item.id}`,
        message: 'مخزون منخفض',
        type: 'warning' as const,
        details: `${item.name} - المتبقي: ${item.quantity} قطع`,
        action: 'طلب توريد جديد',
        link: 'warehouse',
        linkParams: { item: item.id, section: 'inventory' }
      })),
    ...maintenanceRequests
      .filter(req => req.priority === 'urgent' && req.status === 'pending')
      .map(req => ({
        id: `maintenance-alert-${req.id}`,
        message: 'طلب صيانة عاجل',
        type: 'danger' as const,
        details: `${req.printer_model} - ${req.issue}`,
        action: 'عرض التفاصيل',
        link: 'maintenance',
        linkParams: { request: req.id }
      }))
  ];

  const stats = [
    { 
      title: 'إجمالي الطابعات', 
      value: printers.length, 
      icon: Printer,
      color: 'from-blue-500 to-blue-600',
      page: 'printers'
    },
    { 
      title: 'العملاء النشطين', 
      value: users.filter(u => u.role === 'client').length, 
      icon: Users,
      color: 'from-green-500 to-green-600',
      page: 'users'
    },
    { 
      title: 'طلبات الصيانة', 
      value: maintenanceRequests.filter(r => r.status === 'pending').length, 
      icon: Wrench,
      color: 'from-yellow-500 to-yellow-600',
      page: 'maintenance'
    },
    { 
      title: 'المخزون', 
      value: inventory.reduce((sum, item) => sum + item.quantity, 0), 
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      page: 'warehouse'
    }
  ];

  const isLoading = usersLoading || printersLoading || salesLoading || maintenanceLoading || inventoryLoading;
  const error = usersError || printersError || salesError || maintenanceError || inventoryError;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavigate(stat.page)}
            className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">النشاطات الأخيرة</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ x: 5 }}
                onClick={() => handleNavigate(activity.link)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors relative cursor-pointer"
                onMouseEnter={() => setShowTooltip(parseInt(activity.id))}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'sale' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'rental' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {activity.type === 'sale' ? <Package size={18} /> :
                     activity.type === 'rental' ? <Users size={18} /> :
                     <Wrench size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">التنبيهات</h2>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setExpandedAlert(expandedAlert === parseInt(alert.id) ? null : parseInt(alert.id))}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    alert.type === 'warning' ? 'bg-yellow-50 hover:bg-yellow-100' :
                    'bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'warning' ? 'bg-yellow-200' : 'bg-red-200'
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          alert.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
                        }`}>{alert.message}</p>
                        {expandedAlert === parseInt(alert.id) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-2"
                          >
                            <p className="text-sm text-gray-600 mb-2">{alert.details}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(alert.link);
                              }}
                              className={`text-sm font-medium px-3 py-1 rounded-lg ${
                                alert.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-red-200 text-red-800'
                              }`}
                            >
                              {alert.action}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}