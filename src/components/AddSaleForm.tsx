import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Sale } from '../types';
import { useUsers, usePrinters } from '../hooks/useDatabase';

interface AddSaleFormProps {
  onClose: () => void;
  onSubmit: (sale: Partial<Sale>) => void;
}

export function AddSaleForm({ onClose, onSubmit }: AddSaleFormProps) {
  const { users } = useUsers();
  const { printers } = usePrinters();
  const [formData, setFormData] = useState<Partial<Sale>>({
    type: 'sale',
    printer_id: '',
    client_id: '',
    amount: 0,
    payment_method: 'cash',
    notes: '',
    rental_start_date: '',
    rental_end_date: '',
    rental_period: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.printer_id || !formData.client_id || !formData.amount) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'amount' ? parseFloat(value) : value 
    }));
  };

  // فلترة العملاء والطابعات المتاحة
  const clients = users.filter(user => {
    // التحقق من role_name بدلاً من role
    return user.role_name === 'client';
  });
  const availablePrinters = printers.filter(printer => printer.status === 'available');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">عملية بيع جديدة</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                نوع العملية
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="sale">بيع</option>
                <option value="rental">تأجير</option>
              </select>
            </div>

            <div>
              <label htmlFor="printer_id" className="block text-sm font-medium text-gray-700 mb-1">
                الطابعة
              </label>
              <select
                id="printer_id"
                name="printer_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.printer_id}
                onChange={handleChange}
              >
                <option value="">اختر الطابعة</option>
                {availablePrinters.map(printer => (
                  <option key={printer.id} value={printer.id}>
                    {printer.model} - {printer.serialNumber}
                  </option>
                ))}
              </select>
              {availablePrinters.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  لا توجد طابعات متاحة للبيع حالياً
                </p>
              )}
            </div>

            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
                العميل
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.client_id}
                onChange={handleChange}
              >
                <option value="">اختر العميل</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  لا يوجد عملاء مسجلين في النظام
                </p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                المبلغ
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.amount}
                  onChange={handleChange}
                />
                <span className="absolute left-3 top-2 text-gray-500">ر.س</span>
              </div>
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                طريقة الدفع
              </label>
              <select
                id="payment_method"
                name="payment_method"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <option value="cash">نقدي</option>
                <option value="card">بطاقة</option>
                <option value="transfer">تحويل بنكي</option>
              </select>
            </div>

            {formData.type === 'rental' && (
              <>
                <div>
                  <label htmlFor="rental_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ بداية الإيجار
                  </label>
                  <input
                    type="date"
                    id="rental_start_date"
                    name="rental_start_date"
                    required={formData.type === 'rental'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rental_start_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="rental_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ نهاية الإيجار
                  </label>
                  <input
                    type="date"
                    id="rental_end_date"
                    name="rental_end_date"
                    required={formData.type === 'rental'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rental_end_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="rental_period" className="block text-sm font-medium text-gray-700 mb-1">
                    مدة الإيجار (بالأشهر)
                  </label>
                  <input
                    type="number"
                    id="rental_period"
                    name="rental_period"
                    min="1"
                    required={formData.type === 'rental'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rental_period}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات إضافية
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={availablePrinters.length === 0 || clients.length === 0}
            >
              إتمام العملية
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