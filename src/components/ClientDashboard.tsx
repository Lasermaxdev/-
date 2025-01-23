import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Building2, Phone, Mail, MapPin, 
  Printer, Calendar, Package, Clock,
  Wifi, WifiOff
} from 'lucide-react';
import { useUsers, useSales, useMaintenanceRequests } from '../hooks/useDatabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { User, Sale, MaintenanceRequest } from '../types';

export function ClientDashboard() {
  const { users, isLoading: usersLoading, error: usersError } = useUsers();
  const { sales, isLoading: salesLoading, error: salesError } = useSales();
  const { requests: maintenanceRequests, isLoading: maintenanceLoading, error: maintenanceError } = useMaintenanceRequests();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  // دالة للتحقق من نشاط العميل
  const isClientActive = (clientId: string) => {
    // التحقق من وجود مبيعات نشطة
    const hasActiveSales = sales.some(sale => 
      sale.client_id === clientId && 
      sale.status !== 'cancelled'
    );

    // التحقق من وجود طلبات صيانة حديثة (خلال آخر 3 أشهر)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const hasRecentMaintenance = maintenanceRequests.some(req => 
      req.clientId === clientId && 
      new Date(req.created_at || '') > threeMonthsAgo
    );

    return hasActiveSales || hasRecentMaintenance;
  };

  // دالة لحساب آخر نشاط للعميل
  const getLastActivity = (clientId: string) => {
    const clientSales = sales.filter(sale => sale.client_id === clientId);
    const clientMaintenance = maintenanceRequests.filter(req => req.clientId === clientId);

    const dates = [
      ...clientSales.map(sale => new Date(sale.created_at || '')),
      ...clientMaintenance.map(req => new Date(req.created_at || ''))
    ];

    return dates.length > 0 ? Math.max(...dates.map(d => d.getTime())) : null;
  };

  // دالة للتحقق من حالة الاتصال للعميل
  const isClientOnline = (client: User) => {
    if (!client.lastPing) return false;
    
    // اعتبار المستخدم غير متصل إذا لم يرسل إشارة حياة خلال الدقيقتين الماضيتين
    const lastPingTime = new Date(client.lastPing).getTime();
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
    
    return lastPingTime > twoMinutesAgo;
  };

  // فلترة العملاء النشطين فقط
  const activeClients = users.filter(user => 
    user.role === 'client' && 
    isClientActive(user.id) &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    // ترتيب العملاء حسب آخر نشاط
    const lastActivityA = getLastActivity(a.id) || 0;
    const lastActivityB = getLastActivity(b.id) || 0;
    return lastActivityB - lastActivityA;
  });

  // دالة لحساب إحصائيات العميل
  const getClientStats = (clientId: string) => {
    const clientSales = sales.filter(sale => sale.client_id === clientId);
    const clientMaintenance = maintenanceRequests.filter(req => req.clientId === clientId);
    const lastActivity = getLastActivity(clientId);
    
    return {
      totalSales: clientSales.length,
      activePrinters: clientSales.filter(sale => sale.status !== 'cancelled').length,
      pendingMaintenance: clientMaintenance.filter(req => req.status === 'pending').length,
      totalSpent: clientSales.reduce((sum, sale) => sum + sale.amount, 0),
      lastActivity: lastActivity ? new Date(lastActivity) : null
    };
  };

  if (usersLoading || salesLoading || maintenanceLoading) {
    return <LoadingSpinner />;
  }

  if (usersError || salesError || maintenanceError) {
    return <ErrorMessage message="حدث خطأ في تحميل البيانات" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء النشطون</h1>
          <p className="text-gray-500 mt-1">عرض العملاء الذين لديهم مبيعات نشطة أو طلبات صيانة حديثة</p>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="البحث عن عميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* شبكة العملاء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {activeClients.map((client) => {
            const stats = getClientStats(client.id);
            const isExpanded = expandedClient === client.id;
            const online = isClientOnline(client);

            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all"
              >
                {/* رأس العميل */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{client.name}</h3>
                          {online ? (
                            <Wifi className="h-4 w-4 text-green-300" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                        {client.company && (
                          <div className="flex items-center gap-1 text-blue-100">
                            <Building2 size={16} />
                            <span>{client.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {online ? 'متصل' : 'غير متصل'}
                    </div>
                  </div>
                </div>

                {/* إحصائيات العميل */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Printer size={16} />
                      <span className="text-sm">الطابعات النشطة</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stats.activePrinters}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package size={16} />
                      <span className="text-sm">إجمالي المبيعات</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalSales}</p>
                  </div>
                </div>

                {/* آخر نشاط */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>
                      آخر نشاط: {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString('ar-SA') : 'لا يوجد'}
                    </span>
                  </div>
                </div>

                {/* المحتوى الموسع */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-100 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span>{client.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>تاريخ التسجيل: {new Date(client.created_at || '').toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">إجمالي المدفوعات:</span>
                          <span className="font-bold text-green-600">{stats.totalSpent.toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">طلبات الصيانة المعلقة:</span>
                          <span className={`font-bold ${stats.pendingMaintenance > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {stats.pendingMaintenance}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {activeClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد عملاء نشطين</h3>
          <p className="text-gray-500">لم يتم العثور على عملاء نشطين مطابقين لبحثك</p>
        </div>
      )}
    </motion.div>
  );
}