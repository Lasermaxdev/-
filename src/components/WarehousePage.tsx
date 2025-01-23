import React, { useState } from 'react';
import { Package, Search, Plus, AlertCircle, TrendingDown, ArrowDownToLine, Printer, BarChart2, Archive, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddItemForm } from './AddItemForm';
import { AddPrinterForm } from './AddPrinterForm';
import { usePrinters, useInventory } from '../hooks/useDatabase';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export function WarehousePage() {
  const { printers, isLoading: printersLoading, error: printersError, addPrinter } = usePrinters();
  const { items, isLoading: itemsLoading, error: itemsError, addItem } = useInventory();
  
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddPrinterForm, setShowAddPrinterForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'printers'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddItem = async (newItem: any) => {
    try {
      const success = await addItem(newItem);
      if (success) {
        setShowAddItemForm(false);
        setStatusMessage({ type: 'success', text: 'تم إضافة الصنف بنجاح' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الصنف' });
    }
  };

  const handleAddPrinter = async (printer: any) => {
    try {
      const success = await addPrinter(printer);
      if (success) {
        setShowAddPrinterForm(false);
        setStatusMessage({ type: 'success', text: 'تم إضافة الطابعة بنجاح' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الطابعة' });
    }
  };

  const filteredInventory = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || printer.condition === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { 
      title: 'إجمالي الأصناف', 
      value: items.length,
      icon: Archive,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'تحت الحد الأدنى', 
      value: items.filter(item => item.quantity <= item.minQuantity).length,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600'
    },
    { 
      title: 'طلبات التوريد', 
      value: items.filter(item => item.quantity <= item.minQuantity).length,
      icon: TrendingDown,
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  if (printersLoading || itemsLoading) {
    return <LoadingSpinner />;
  }

  if (printersError || itemsError) {
    return <ErrorMessage message={printersError || itemsError} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddItemForm(true)}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <Plus size={20} />
            <span>إضافة قطع غيار</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddPrinterForm(true)}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <Printer size={20} />
            <span>إضافة طابعة</span>
          </motion.button>
        </div>
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

      {showAddItemForm && (
        <AddItemForm
          onClose={() => setShowAddItemForm(false)}
          onSubmit={handleAddItem}
        />
      )}

      {showAddPrinterForm && (
        <AddPrinterForm
          onClose={() => setShowAddPrinterForm(false)}
          onSubmit={handleAddPrinter}
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
        className="bg-white rounded-xl shadow-sm"
      >
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              قطع الغيار والمستلزمات
            </button>
            <button
              onClick={() => setActiveTab('printers')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'printers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              الطابعات
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={activeTab === 'items' ? "بحث في المخزون..." : "بحث في الطابعات..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {activeTab === 'items' ? (
                <>
                  <option value="">جميع الفئات</option>
                  <option value="ink">حبر</option>
                  <option value="spare">قطع غيار</option>
                  <option value="paper">ورق</option>
                </>
              ) : (
                <>
                  <option value="">جميع الحالات</option>
                  <option value="new">جديد</option>
                  <option value="used">مستعمل</option>
                  <option value="maintenance">صيانة</option>
                </>
              )}
            </select>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'items' ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الصنف</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">رقم الصنف</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الكمية</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الموقع</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredInventory.map((item) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                              item.category === 'ink' ? 'from-blue-500 to-blue-600' :
                              item.category === 'spare' ? 'from-purple-500 to-purple-600' :
                              'from-green-500 to-green-600'
                            } flex items-center justify-center`}>
                              <Tag className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                {item.category === 'ink' ? 'حبر' :
                                 item.category === 'spare' ? 'قطع غيار' :
                                 'ورق'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{item.sku}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.quantity}</div>
                          <div className="text-sm text-gray-500">الحد الأدنى: {item.minQuantity}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{item.location}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.quantity <= item.minQuantity
                              ? 'bg-red-100 text-red-800'
                              : item.quantity <= item.minQuantity * 1.5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity <= item.minQuantity
                              ? 'تحت الحد الأدنى'
                              : item.quantity <= item.minQuantity * 1.5
                              ? 'منخفض'
                              : 'متوفر'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ArrowDownToLine size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الطابعة</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الرقم التسلسلي</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">النوع</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredPrinters.map((printer) => (
                      <motion.tr
                        key={printer.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                              printer.status === 'available' ? 'from-green-500 to-green-600' :
                              printer.status === 'maintenance' ? 'from-yellow-500 to-yellow-600' :
                              'from-gray-500 to-gray-600'
                            } flex items-center justify-center`}>
                              <Printer className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{printer.model}</div>
                              <div className="text-sm text-gray-500">{printer.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{printer.serialNumber}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {printer.type === 'color' ? 'ملون' : 'أسود'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            printer.status === 'available' ? 'bg-green-100 text-green-800' :
                            printer.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {printer.status === 'available' ? 'متاح' :
                             printer.status === 'maintenance' ? 'في الصيانة' :
                             printer.status === 'rented' ? 'مؤجر' : 'مباع'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{printer.location}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}