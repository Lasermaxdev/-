import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Printer } from '../types';

interface EditPrinterFormProps {
  printer: Printer;
  onClose: () => void;
  onSubmit: (printerData: Partial<Printer>) => void;
}

export function EditPrinterForm({ printer, onClose, onSubmit }: EditPrinterFormProps) {
  const [formData, setFormData] = useState<Partial<Printer>>({
    model: printer.model,
    serialNumber: printer.serialNumber,
    type: printer.type,
    status: printer.status,
    condition: printer.condition,
    brand: printer.brand,
    purchaseDate: printer.purchaseDate || '',
    warrantyEnd: printer.warrantyEnd || '',
    location: printer.location || '',
    notes: printer.notes || ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.model || !formData.serialNumber || !formData.brand) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">تعديل بيانات الطابعة</h2>

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                id="status"
                name="status"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="available">متاحة</option>
                <option value="rented">مؤجرة</option>
                <option value="maintenance">في الصيانة</option>
                <option value="sold">مباعة</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                حالة الطابعة
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

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}