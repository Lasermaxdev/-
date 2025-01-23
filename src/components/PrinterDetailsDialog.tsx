import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Calendar, Wrench, Gauge, Package, 
  AlertCircle, CheckCircle2, Clock, Cpu, Info,
  BarChart2, Settings, Zap, History, DollarSign,
  TrendingUp, ClipboardList, XCircle, Loader2,
  Palette
} from 'lucide-react';
import { Printer as PrinterType } from '../types';
import { usePrinterMaintenance } from '../hooks/usePrinterMaintenance';

interface PrinterDetailsDialogProps {
  printer: PrinterType;
  onClose: () => void;
}

export function PrinterDetailsDialog({ printer, onClose }: PrinterDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'status' | 'history' | 'stats'>('overview');
  const { maintenanceHistory, stats, isLoading, error } = usePrinterMaintenance(printer.id);

  // حساب نسب الاستخدام
  const getUsagePercentage = (value: number = 0) => {
    return Math.max(0, Math.min(100, 100 - value));
  };

  // تحديد حالة المكونات
  const getComponentStatus = (value: number = 0) => {
    if (value > 70) return { color: 'text-green-500', status: 'جيد', bgColor: 'bg-green-500' };
    if (value > 30) return { color: 'text-yellow-500', status: 'متوسط', bgColor: 'bg-yellow-500' };
    return { color: 'text-red-500', status: 'منخفض', bgColor: 'bg-red-500' };
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Info },
    { id: 'status', label: 'الحالة والعدادات', icon: Gauge },
    { id: 'history', label: 'سجل الصيانة', icon: History },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart2 }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl relative flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rotate-45 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <Printer className="h-10 w-10 text-white relative z-10" />
            </motion.div>
            <div className="text-white">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold"
              >
                {printer.model}
              </motion.h2>
              <div className="flex items-center gap-2 text-blue-100 mt-2">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <Cpu size={16} />
                  {printer.serialNumber}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <Wrench size={16} />
                  {printer.condition === 'new' ? 'جديدة' : 'مستعملة'}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <Palette size={16} />
                  {printer.type === 'color' ? 'ملونة' : 'أبيض وأسود'}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* معلومات أساسية */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">العلامة التجارية</h3>
                        <p className="text-blue-600 font-semibold">{printer.brand}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">تاريخ الشراء</h3>
                        <p className="text-green-600 font-semibold">{printer.purchaseDate || 'غير محدد'}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">الموقع</h3>
                        <p className="text-purple-600 font-semibold">{printer.location || 'غير محدد'}</p>
                      </div>
                    </div>
                  </motion.div>
                </section>

                {/* المواصفات */}
                {printer.specifications && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      المواصفات الفنية
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{printer.specifications}</p>
                    </div>
                  </motion.section>
                )}
              </motion.div>
            )}

            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* العدادات */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                    العدادات
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">عداد الأسود</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {printer.counter_bw?.toLocaleString() || 0}
                        </span>
                      </div>
                    </motion.div>

                    {printer.type === 'color' && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">عداد الألوان</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {printer.counter_colored?.toLocaleString() || 0}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 col-span-full"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">العداد الكلي</span>
                        <span className="text-3xl font-bold text-green-600">
                          {printer.total_counter?.toLocaleString() || 0}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* مستويات الحبر والدرم */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    مستويات الحبر والدرم
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* مستويات الحبر */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-4">مستويات الحبر</h4>
                      {printer.type === 'color' ? (
                        <div className="space-y-4">
                          {[
                            { label: 'أسود (K)', value: printer.ink_k, color: 'bg-gray-800' },
                            { label: 'سماوي (C)', value: printer.ink_c, color: 'bg-cyan-500' },
                            { label: 'أرجواني (M)', value: printer.ink_m, color: 'bg-pink-500' },
                            { label: 'أصفر (Y)', value: printer.ink_y, color: 'bg-yellow-500' }
                          ].map((ink) => (
                            <motion.div
                              key={ink.label}
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            >
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{ink.label}</span>
                                <span className={getComponentStatus(ink.value).color}>
                                  {ink.value}%
                                </span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full ${ink.color} transition-all duration-500`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ink.value}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">الحبر الأسود</span>
                            <span className={getComponentStatus(printer.ink_bw).color}>
                              {printer.ink_bw}%
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gray-800 transition-all duration-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${printer.ink_bw}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* مستويات الدرم */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-4">مستويات الدرم</h4>
                      {printer.type === 'color' ? (
                        <div className="space-y-4">
                          {[
                            { label: 'درم أسود (K)', value: printer.drum_k, color: 'bg-gray-800' },
                            { label: 'درم سماوي (C)', value: printer.drum_c, color: 'bg-cyan-500' },
                            { label: 'درم أرجواني (M)', value: printer.drum_m, color: 'bg-pink-500' },
                            { label: 'درم أصفر (Y)', value: printer.drum_y, color: 'bg-yellow-500' }
                          ].map((drum) => (
                            <motion.div
                              key={drum.label}
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            >
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{drum.label}</span>
                                <span className={getComponentStatus(drum.value).color}>
                                  {drum.value}%
                                </span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full ${drum.color} transition-all duration-500`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${drum.value}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">الدرم</span>
                            <span className={getComponentStatus(printer.drum_bw).color}>
                              {printer.drum_bw}%
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gray-800 transition-all duration-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${printer.drum_bw}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-500" />
                    سجل الصيانة
                  </h3>

                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <p className="text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                      </p>
                    </div>
                  ) : maintenanceHistory.length > 0 ? (
                    <div className="space-y-4">
                      {maintenanceHistory.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.01 }}
                          className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                request.status === 'completed' ? 'bg-green-500' :
                                request.status === 'in_progress' ? 'bg-blue-500' :
                                request.status === 'cancelled' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}>
                                {request.status === 'completed' ? (
                                  <CheckCircle2 className="h-5 w-5 text-white" />
                                ) : request.status === 'in_progress' ? (
                                  <Clock className="h-5 w-5 text-white" />
                                ) : request.status === 'cancelled' ? (
                                  <XCircle className="h-5 w-5 text-white" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {request.issue}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    request.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {request.priority === 'urgent' ? 'عاجل' :
                                     request.priority === 'high' ? 'مرتفع' :
                                     request.priority === 'normal' ? 'عادي' :
                                     'منخفض'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(request.created_at).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {request.completion_date && (
                                <div className="text-sm">
                                  <span className="text-gray-500">تاريخ الإكمال:</span>
                                  <span className="text-gray-900 font-medium mr-1">
                                    {new Date(request.completion_date).toLocaleDateString('ar-SA')}
                                  </span>
                                </div>
                              )}
                              {request.cost && (
                                <div className="text-sm mt-1">
                                  <span className="text-gray-500">التكلفة:</span>
                                  <span className="text-gray-900 font-medium mr-1">
                                    {request.cost.toLocaleString()} ر.س
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {(request.diagnosis || request.solution) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              {request.diagnosis && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">التشخيص:</span> {request.diagnosis}
                                </p>
                              )}
                              {request.solution && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">الحل:</span> {request.solution}
                                </p>
                              )}
                            </div>
                          )}
                          {request.parts && request.parts.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700 mb-1">القطع المستخدمة:</p>
                              <div className="space-y-1">
                                {request.parts.map((part, index) => (
                                  <p key={index} className="text-sm text-gray-600">
                                    {part.part.name} ({part.quantity} قطعة)
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 text-center">
                      <Wrench className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-yellow-800 font-medium">لا يوجد سجل صيانة سابق</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        لم يتم تسجيل أي طلبات صيانة لهذه الطابعة بعد
                      </p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">إجمالي الطلبات</h3>
                        <p className="text-blue-600 font-semibold">{stats.totalRequests}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">الطلبات المكتملة</h3>
                        <p className="text-green-600 font-semibold">{stats.completedRequests}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">متوسط وقت الاستجابة</h3>
                        <p className="text-yellow-600 font-semibold">
                          {stats.averageResponseTime} يوم ```tsx
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">إجمالي التكاليف</h3>
                        <p className="text-purple-600 font-semibold">
                          {stats.totalCost.toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    تواريخ هامة
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">آخر صيانة</p>
                        <p className="font-medium text-gray-900">
                          {stats.lastMaintenanceDate ? 
                            new Date(stats.lastMaintenanceDate).toLocaleDateString('ar-SA') : 
                            'لا يوجد'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الصيانة القادمة</p>
                        <p className="font-medium text-gray-900">
                          {stats.nextScheduledMaintenance ? 
                            new Date(stats.nextScheduledMaintenance).toLocaleDateString('ar-SA') : 
                            'غير مجدولة'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}