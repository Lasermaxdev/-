import React from 'react';
import { X, Printer, AlertCircle, CheckCircle2, Clock, Cpu, Calendar, Wrench, Gauge } from 'lucide-react';
import { Printer as PrinterType } from '../types';

interface PrinterStatusDialogProps {
  printer: PrinterType;
  onClose: () => void;
}

export function PrinterStatusDialog({ printer, onClose }: PrinterStatusDialogProps) {
  // تعريف مستويات الحبر بناءً على نوع الطابعة
  const inkLevels = printer.type === 'color' ? [
    { color: 'أسود', level: 75, colorClass: 'bg-gray-800', bgClass: 'bg-gray-100' },
    { color: 'سماوي', level: 60, colorClass: 'bg-cyan-500', bgClass: 'bg-cyan-100' },
    { color: 'ماجنتا', level: 45, colorClass: 'bg-pink-500', bgClass: 'bg-pink-100' },
    { color: 'أصفر', level: 30, colorClass: 'bg-yellow-500', bgClass: 'bg-yellow-100' },
  ] : [
    { color: 'أسود', level: 75, colorClass: 'bg-gray-800', bgClass: 'bg-gray-100' },
  ];

  // تعريف قطع الغيار بناءً على نوع الطابعة
  const spareParts = printer.type === 'color' ? [
    { name: 'درام أسود', status: 'good', usagePercentage: 25, remainingPages: 15000 },
    { name: 'درام سماوي', status: 'warning', usagePercentage: 65, remainingPages: 5000 },
    { name: 'درام ماجنتا', status: 'good', usagePercentage: 30, remainingPages: 12000 },
    { name: 'درام أصفر', status: 'warning', usagePercentage: 70, remainingPages: 4000 },
    { name: 'فيوزر', status: 'warning', usagePercentage: 65, remainingPages: 5000 },
    { name: 'بكرات السحب', status: 'critical', usagePercentage: 90, remainingPages: 1000 },
  ] : [
    { name: 'درام', status: 'good', usagePercentage: 25, remainingPages: 15000 },
    { name: 'فيوزر', status: 'warning', usagePercentage: 65, remainingPages: 5000 },
    { name: 'بكرات السحب', status: 'critical', usagePercentage: 90, remainingPages: 1000 },
  ];

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-blue-500 to-blue-600 p-6">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-white hover:text-blue-100 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Printer className="h-10 w-10 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">{printer.model}</h2>
              <div className="flex items-center gap-2 text-blue-100 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                  <Cpu size={16} />
                  {printer.serialNumber}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                  <Wrench size={16} />
                  {printer.condition === 'new' ? 'جديدة' : 'مستعملة'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                  <Gauge size={16} />
                  {printer.type === 'color' ? 'ملونة' : 'أبيض وأسود'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* عدادات الطابعة */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">＃</span>
              </div>
              عداد الطباعة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">عداد الأسود</span>
                  <span className="text-xl font-bold text-gray-900">
                    {printer.counters?.black?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              {printer.type === 'color' && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">عداد الألوان</span>
                    <span className="text-xl font-bold text-gray-900">
                      {printer.counters?.color?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* مستويات الحبر */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold">○</span>
              </div>
              مستويات الحبر
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inkLevels.map((ink) => (
                <div key={ink.color} className={`${ink.bgClass} rounded-xl p-4 border border-gray-100`}>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">{ink.color}</span>
                    <span className="text-sm font-bold text-gray-900">{ink.level}%</span>
                  </div>
                  <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ink.colorClass} transition-all duration-300`}
                      style={{ width: `${ink.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* حالة قطع الغيار */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">⚙</span>
              </div>
              حالة قطع الغيار
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spareParts.map((part) => (
                <div key={part.name} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(part.status)}
                      <span className="text-sm font-medium text-gray-700">{part.name}</span>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                      part.status === 'critical' ? 'bg-red-100 text-red-700' :
                      part.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {part.status === 'critical' ? 'بحاجة للاستبدال' :
                       part.status === 'warning' ? 'تحذير' :
                       'جيدة'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          part.status === 'critical' ? 'bg-red-500' :
                          part.status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${part.usagePercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">نسبة الاستخدام: {part.usagePercentage}%</span>
                      <span className="font-medium text-gray-700">
                        العمر المتبقي: {part.remainingPages.toLocaleString()} صفحة
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}