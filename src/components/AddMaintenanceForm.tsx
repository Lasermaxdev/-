import React, { useState, useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import { useUsers, useSales, usePrinters } from '../hooks/useDatabase';

interface AddMaintenanceFormProps {
  onClose: () => void;
  onSubmit: (request: any) => void;
}

export function AddMaintenanceForm({ onClose, onSubmit }: AddMaintenanceFormProps) {
  const { users } = useUsers(); // جلب المستخدمين
  const { printers } = usePrinters(); // جلب الطابعات
  const { sales } = useSales(); // جلب بيانات المبيعات

  const [selectedClient, setSelectedClient] = useState('');
  const [clientPrinters, setClientPrinters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    client_id: '',
    printer_id: '',
    issue: '',
    priority: 'normal',
    scheduled_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // فلترة العملاء بناءً على role_name
  const clients = users.filter(user => user.role_name === 'client');

  // تحديث قائمة الطابعات عند اختيار العميل
  useEffect(() => {
    if (selectedClient) {
      // جلب الطابعات المرتبطة بالعميل من جدول المبيعات
      const clientSales = sales.filter(sale => sale.client_id === selectedClient);
      const printerIds = clientSales.map(sale => sale.printer_id);
      const filteredPrinters = printers.filter(printer => printerIds.includes(printer.id));
      setClientPrinters(filteredPrinters);
    } else {
      setClientPrinters([]);
    }
  }, [selectedClient, sales, printers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id || !formData.printer_id || !formData.issue) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'client_id') {
      setSelectedClient(value); // تحديث العميل المختار
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">طلب صيانة جديد</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار العميل */}
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
                  {client.name} - {client.company || 'عميل فردي'}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار الطابعة */}
          <div>
            <label htmlFor="printer_id" className="block text-sm font-medium text-gray-700 mb-1">
              الطابعة
            </label>
            <select
              id="printer_id"
              name="printer_id"
              required
              disabled={!selectedClient}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              value={formData.printer_id}
              onChange={handleChange}
            >
              <option value="">اختر الطابعة</option>
              {clientPrinters.map(printer => (
                <option key={printer.id} value={printer.id}>
                  {printer.model} - {printer.serialNumber}
                </option>
              ))}
            </select>
            {!selectedClient && (
              <p className="mt-1 text-sm text-gray-500">
                يرجى اختيار العميل أولاً
              </p>
            )}
          </div>

          {/* تاريخ الصيانة */}
          <div>
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ الصيانة
            </label>
            <input
              type="date"
              id="scheduled_date"
              name="scheduled_date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.scheduled_date}
              onChange={handleChange}
            />
          </div>

          {/* وصف المشكلة */}
          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
              وصف المشكلة
            </label>
            <input
              type="text"
              id="issue"
              name="issue"
              required
              placeholder="اكتب وصفاً مختصراً للمشكلة"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.issue}
              onChange={handleChange}
            />
          </div>

          {/* مستوى الأولوية */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              مستوى الأولوية
            </label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">منخفضة</option>
              <option value="normal">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>

          {/* تفاصيل إضافية */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              تفاصيل إضافية (اختياري)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="أضف أي ملاحظات أو تفاصيل إضافية تتعلق بالمشكلة"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700"
            >
              إرسال طلب الصيانة
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