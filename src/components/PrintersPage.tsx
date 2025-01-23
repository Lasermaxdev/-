import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, Search, Edit2, Trash2, BarChart2, Package, 
  Wrench, DollarSign, Plus 
} from 'lucide-react';
import { Printer as PrinterType } from '../types';
import { PrinterDetailsDialog } from './PrinterDetailsDialog';
import { EditPrinterForm } from './EditPrinterForm';
import { DeletePrinterDialog } from './DeletePrinterDialog';
import { usePrinters } from '../hooks/useDatabase';
import { usePrinterActions } from '../hooks/usePrinterActions';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const statusLabels = {
  available: 'متاح',
  rented: 'مؤجر',
  maintenance: 'صيانة',
  sold: 'مباع'
};

const statusColors = {
  available: 'bg-green-100 text-green-800',
  rented: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-gray-100 text-gray-800'
};

export function PrintersPage() {
  const { printers, isLoading, error, reloadPrinters } = usePrinters();
  const { deletePrinter, updatePrinter } = usePrinterActions();
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [deletingPrinter, setDeletingPrinter] = useState<PrinterType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleEditPrinter = async (printerData: Partial<PrinterType>) => {
    try {
      if (!editingPrinter) return;
      await updatePrinter(editingPrinter.id, printerData);
      await reloadPrinters();
      setEditingPrinter(null);
      setStatusMessage({ type: 'success', text: 'تم تحديث بيانات الطابعة بنجاح' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الطابعة' });
    }
  };

  const handleDeletePrinter = async () => {
    try {
      if (!deletingPrinter) return;
      
      await deletePrinter(deletingPrinter.id);
      await reloadPrinters();
      setDeletingPrinter(null);
      setStatusMessage({ type: 'success', text: 'تم حذف الطابعة بنجاح' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الطابعة'
      });
    }
  };

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || printer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { 
      title: 'إجمالي الطابعات', 
      value: printers.length, 
      icon: Printer,
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      title: 'متاحة للبيع', 
      value: printers.filter(p => p.status === 'available').length,
      icon: Package,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'في الصيانة', 
      value: printers.filter(p => p.status === 'maintenance').length,
      icon: Wrench,
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      title: 'مؤجرة', 
      value: printers.filter(p => p.status === 'rented').length,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={reloadPrinters} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الطابعات</h1>
        <div className="text-sm text-gray-500">
          * يتم إضافة الطابعات الجديدة من خلال قسم المخزن
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

      {selectedPrinter && (
        <PrinterDetailsDialog
          printer={selectedPrinter}
          onClose={() => setSelectedPrinter(null)}
        />
      )}

      {editingPrinter && (
        <EditPrinterForm
          printer={editingPrinter}
          onClose={() => setEditingPrinter(null)}
          onSubmit={handleEditPrinter}
        />
      )}

      {deletingPrinter && (
        <DeletePrinterDialog
          printerModel={deletingPrinter.model}
          onConfirm={handleDeletePrinter}
          onCancel={() => setDeletingPrinter(null)}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              placeholder="بحث عن طابعة..."
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
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الرقم التسلسلي</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">النوع</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">العداد الكلي</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
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
                          printer.status === 'rented' ? 'from-blue-500 to-blue-600' :
                          printer.status === 'maintenance' ? 'from-yellow-500 to-yellow-600' :
                          'from-gray-500 to-gray-600'
                        } flex items-center justify-center`}>
                          <Printer className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedPrinter(printer)}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {printer.model}
                          </button>
                          <div className="text-sm text-gray-500">
                            {printer.condition === 'new' ? 'جديد' : 'مستعمل'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{printer.serialNumber}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {printer.type === 'color' ? 'ملون' : 'أسود'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[printer.status]}`}>
                        {statusLabels[printer.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {printer.total_counter?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingPrinter(printer)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeletingPrinter(printer)}
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
      </motion.div>
    </motion.div>
  );
}