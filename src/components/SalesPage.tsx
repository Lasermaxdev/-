import React, { useState } from 'react';
import { DollarSign, Search, Plus, Tag, Calendar, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sale } from '../types';
import { AddSaleForm } from './AddSaleForm';
import { useSales } from '../hooks/useDatabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const statusLabels = {
  pending: 'قيد الانتظار',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const typeColors = {
  sale: 'from-blue-500 to-blue-600',
  rental: 'from-purple-500 to-purple-600'
};

export function SalesPage() {
  const { sales, isLoading, error, addSale, reloadSales } = useSales();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'sale' | 'rental' | ''>('');

  const handleAddSale = async (saleData: any) => {
    const success = await addSale(saleData);
    if (success) {
      setShowAddForm(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.printer_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || sale.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = [
    { 
      title: 'إجمالي المبيعات', 
      value: sales.reduce((sum, sale) => sum + sale.amount, 0).toLocaleString() + ' ر.س',
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'عمليات البيع', 
      value: sales.filter(s => s.type === 'sale').length,
      icon: Tag,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'التأجير النشط', 
      value: sales.filter(s => s.type === 'rental' && s.status !== 'cancelled').length,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={reloadSales} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المبيعات</h1>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          <span>عملية بيع جديدة</span>
        </motion.button>
      </div>

      {showAddForm && (
        <AddSaleForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddSale}
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
              placeholder="بحث في المبيعات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'sale' | 'rental' | '')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع العمليات</option>
            <option value="sale">مبيعات</option>
            <option value="rental">تأجير</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">العملية</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المبلغ</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredSales.map((sale) => (
                  <motion.tr
                    key={sale.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${typeColors[sale.type]} flex items-center justify-center`}>
                          {sale.type === 'sale' ? (
                            <Tag className="h-5 w-5 text-white" />
                          ) : (
                            <Calendar className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {sale.type === 'sale' ? 'بيع' : 'تأجير'}
                          </div>
                          <div className="text-sm text-gray-500">{sale.printer_model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{sale.client_name}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sale.amount.toLocaleString()} ر.س</div>
                      <div className="text-sm text-gray-500">
                        {sale.type === 'rental' ? 'شهرياً' : 'إجمالي'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(sale.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                        {statusLabels[sale.status]}
                      </span>
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