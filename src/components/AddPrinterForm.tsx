import React, { useState } from 'react';
import { X, Printer, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { SNMPPrinterData } from '../types/printer';

interface AddPrinterFormProps {
  onClose: () => void;
  onSubmit: (printer: any) => void;
}

export function AddPrinterForm({ onClose, onSubmit }: AddPrinterFormProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setError] = useState<string | null>(null);
  const [printerIP, setPrinterIP] = useState('');
  const [formData, setFormData] = useState({
    model: '',
    serialNumber: '',
    type: 'bw',
    status: 'available',
    printer_condition: 'new',
    brand: '',
    purchaseDate: '',
    warrantyEnd: '',
    location: '',
    specifications: '',
    notes: '',
    ink_c: '',
    ink_m: '',
    ink_y: '',
    ink_k: '',
    ink_bw: '',
    ink_note: '',
    drum_c: '',
    drum_m: '',
    drum_y: '',
    drum_k: '',
    drum_bw: '',
    drum_note: '',
    counter_colored: '',
    counter_bw: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScan = async () => {
    if (!printerIP) {
      setError('الرجاء إدخال عنوان IP للطابعة');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/printers/detect?ip=${printerIP}`);
      
      if (!response.ok) {
        throw new Error('فشل في الاتصال بالطابعة');
      }

      const printerData: SNMPPrinterData = await response.json();
      
      setFormData(prev => ({
        ...prev,
        model: printerData.model,
        serialNumber: printerData.serialNumber,
        type: printerData.type,
        ink_k: printerData.inkLevels.black.toString(),
        ink_c: printerData.type === 'color' ? printerData.inkLevels.cyan?.toString() || '0' : '0',
        ink_m: printerData.type === 'color' ? printerData.inkLevels.magenta?.toString() || '0' : '0',
        ink_y: printerData.type === 'color' ? printerData.inkLevels.yellow?.toString() || '0' : '0',
        ink_bw: printerData.type === 'bw' ? printerData.inkLevels.black.toString() : '0',
        drum_k: printerData.drumLevels.black.toString(),
        drum_c: printerData.type === 'color' ? printerData.drumLevels.cyan?.toString() || '0' : '0',
        drum_m: printerData.type === 'color' ? printerData.drumLevels.magenta?.toString() || '0' : '0',
        drum_y: printerData.type === 'color' ? printerData.drumLevels.yellow?.toString() || '0' : '0',
        drum_bw: printerData.type === 'bw' ? printerData.drumLevels.black.toString() : '0',
        counter_colored: printerData.type === 'color' ? printerData.counters.color?.toString() || '0' : '0',
        counter_bw: printerData.counters.black.toString()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الكشف التلقائي');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Printer className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">إضافة طابعة جديدة</h2>
              <p className="text-blue-100 mt-1">أدخل معلومات الطابعة الجديدة</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 sticky top-0 bg-white z-10 py-2">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                إدخال يدوي
              </button>
              <button
                onClick={() => setActiveTab('auto')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'auto'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                كشف تلقائي
              </button>
            </div>

            {activeTab === 'auto' && (
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أدخل عنوان IP للطابعة"
                    value={printerIP}
                    onChange={(e) => setPrinterIP(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>جاري الكشف...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="h-5 w-5" />
                        <span>كشف تلقائي</span>
                      </>
                    )}
                  </button>
                </div>

                {scanError && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{scanError}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} id="printerForm" className="space-y-8">
              {/* معلومات الطابعة الأساسية */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">معلومات الطابعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                      العلامة التجارية
                    </label>
                    <select
                      id="brand"
                      name="brand"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.brand}
                      onChange={handleChange}
                    >
                      <option value="">اختر العلامة التجارية</option>
                      <option value="HP">HP</option>
                      <option value="Canon">Canon</option>
                      <option value="Epson">Epson</option>
                      <option value="Brother">Brother</option>
                      <option value="Xerox">Xerox</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      موديل الطابعة
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.model}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      الرقم التسلسلي
                    </label>
                    <input
                      type="text"
                      id="serialNumber"
                      name="serialNumber"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.serialNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      نوع الطابعة
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="bw">أسود وأبيض</option>
                      <option value="color">ملونة</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                      الحالة
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.condition}
                      onChange={handleChange}
                    >
                      <option value="new">جديدة</option>
                      <option value="used">مستعملة</option>
                      <option value="refurbished">مجددة</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      موقع التخزين
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ الشراء
                    </label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="warrantyEnd" className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ انتهاء الضمان
                    </label>
                    <input
                      type="date"
                      id="warrantyEnd"
                      name="warrantyEnd"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.warrantyEnd}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
                    المواصفات الفنية
                  </label>
                  <textarea
                    id="specifications"
                    name="specifications"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.specifications}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* مستويات الحبر */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">مستويات الحبر</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.type === 'color' ? (
                    <>
                      <div>
                        <label htmlFor="ink_k" className="block text-sm font-medium text-gray-700 mb-1">
                          مستوى الحبر الأسود (K)
                        </label>
                        <input
                          type="number"
                          id="ink_k"
                          name="ink_k"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.ink_k}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="ink_c" className="block text-sm font-medium text-gray-700 mb-1">
                          مستوى الحبر السماوي (C)
                        </label>
                        <input
                          type="number"
                          id="ink_c"
                          name="ink_c"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.ink_c}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="ink_m" className="block text-sm font-medium text-gray-700 mb-1">
                          مستوى الحبر الأرجواني (M)
                        </label>
                        <input
                          type="number"
                          id="ink_m"
                          name="ink_m"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.ink_m}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="ink_y" className="block text-sm font-medium text-gray-700 mb-1">
                          مستوى الحبر الأصفر (Y)
                        </label>
                        <input
                          type="number"
                          id="ink_y"
                          name="ink_y"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.ink_y}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label htmlFor="ink_bw" className="block text-sm font-medium text-gray-700 mb-1">
                        مستوى الحبر
                      </label>
                      <input
                        type="number"
                        id="ink_bw"
                        name="ink_bw"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.ink_bw}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label htmlFor="ink_note" className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات حول الحبر
                  </label>
                  <textarea
                    id="ink_note"
                    name="ink_note"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.ink_note}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* حالة الدرم */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">حالة الدرم</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.type === 'color' ? (
                    <>
                      <div>
                        <label htmlFor="drum_k" className="block text-sm font-medium text-gray-700 mb-1">
                          حالة الدرم الأسود (K)
                        </label>
                        <input
                          type="number"
                          id="drum_k"
                          name="drum_k"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.drum_k}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="drum_c" className="block text-sm font-medium text-gray-700 mb-1">
                          حالة الدرم السماوي (C)
                        </label>
                        <input
                          type="number"
                          id="drum_c"
                          name="drum_c"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.drum_c}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="drum_m" className="block text-sm font-medium text-gray-700 mb-1">
                          حالة الدرم الأرجواني (M)
                        </label>
                        <input
                          type="number"
                          id="drum_m"
                          name="drum_m"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.drum_m}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="drum_y" className="block text-sm font-medium text-gray-700 mb-1">
                          حالة الدرم الأصفر (Y)
                        </label>
                        <input
                          type="number"
                          id="drum_y"
                          name="drum_y"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.drum_y}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label htmlFor="drum_bw" className="block text-sm font-medium text-gray-700 mb-1">
                        حالة الدرم
                      </label>
                      <input
                        type="number"
                        id="drum_bw"
                        name="drum_bw"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.drum_bw}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label htmlFor="drum_note" className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات حول الدرم
                  </label>
                  <textarea
                    id="drum_note"
                    name="drum_note"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.drum_note}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* عداد الطباعة */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">عداد الطباعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="counter_bw" className="block text-sm font-medium text-gray-700 mb-1">
                      عداد الأبيض والأسود
                    </label>
                    <input
                      type="number"
                      id="counter_bw"
                      name="counter_bw"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.counter_bw}
                      onChange={handleChange}
                    />
                  </div>
                  {formData.type === 'color' && (
                    <div>
                      <label htmlFor="counter_colored" className="block text-sm font-medium text-gray-700 mb-1">
                        عداد الألوان
                      </label>
                      <input
                        type="number"
                        id="counter_colored"
                        name="counter_colored"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.counter_colored}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">
                      العداد الكلي: {parseInt(formData.counter_bw) + (formData.type === 'color' ? parseInt(formData.counter_colored) : 0)}
                    </p>
                  </div>
                </div>
              </section>

              {/* ملاحظات إضافية */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">ملاحظات إضافية</h3>
                <div>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </section>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
          <div className="flex gap-3">
            <button
              type="submit"
              form="printerForm"
              className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              إضافة الطابعة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}