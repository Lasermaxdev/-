import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, PenTool as Tool, DollarSign, Save, Plus, Minus } from 'lucide-react';
import { useInventory } from '../../hooks/useDatabase';

interface TechnicianMaintenanceFormProps {
  requestId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TechnicianMaintenanceForm({ requestId, onSubmit, onCancel }: TechnicianMaintenanceFormProps) {
  const { items: inventoryItems } = useInventory();
  
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    labor_cost: 0,
    technical_notes: '',
    parts_used: [] as Array<{
      part_id: string;
      quantity: number;
      unit_price: number;
    }>,
    status: 'in_progress'
  });

  const [selectedPart, setSelectedPart] = useState({
    part_id: '',
    quantity: 1,
    unit_price: 0
  });

  const handleAddPart = () => {
    if (!selectedPart.part_id) return;

    setFormData(prev => ({
      ...prev,
      parts_used: [...prev.parts_used, selectedPart]
    }));

    setSelectedPart({
      part_id: '',
      quantity: 1,
      unit_price: 0
    });
  };

  const handleRemovePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts_used: prev.parts_used.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalCost = () => {
    const partsCost = formData.parts_used.reduce((sum, part) => {
      return sum + (part.quantity * part.unit_price);
    }, 0);
    return partsCost + formData.labor_cost;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      total_cost: calculateTotalCost()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('cost') ? parseFloat(value) : value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">تحديث طلب الصيانة</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* وقت العمل */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline-block mr-2" size={18} />
              وقت البدء
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline-block mr-2" size={18} />
              وقت الانتهاء
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* قطع الغيار المستخدمة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tool className="inline-block mr-2" size={18} />
            قطع الغيار المستخدمة
          </label>
          
          <div className="flex gap-4 mb-4">
            <select
              value={selectedPart.part_id}
              onChange={(e) => {
                const part = inventoryItems.find(item => item.id === e.target.value);
                setSelectedPart(prev => ({
                  ...prev,
                  part_id: e.target.value,
                  unit_price: part?.selling_price || 0
                }));
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر قطعة الغيار</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - المتوفر: {item.quantity}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={selectedPart.quantity}
              onChange={(e) => setSelectedPart(prev => ({
                ...prev,
                quantity: parseInt(e.target.value)
              }))}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="الكمية"
            />
            <motion.button
              type="button"
              onClick={handleAddPart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
            </motion.button>
          </div>

          {/* قائمة القطع المضافة */}
          {formData.parts_used.length > 0 && (
            <div className="space-y-2">
              {formData.parts_used.map((part, index) => {
                const item = inventoryItems.find(i => i.id === part.part_id);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{item?.name}</span>
                      <span className="text-sm text-gray-500 mr-2">
                        {part.quantity} × {part.unit_price} ر.س
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        {part.quantity * part.unit_price} ر.س
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* تكلفة العمل */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline-block mr-2" size={18} />
            تكلفة العمل
          </label>
          <input
            type="number"
            name="labor_cost"
            value={formData.labor_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* الملاحظات الفنية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الملاحظات الفنية
          </label>
          <textarea
            name="technical_notes"
            value={formData.technical_notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="أضف أي ملاحظات فنية هنا..."
          />
        </div>

        {/* حالة الطلب */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حالة الطلب
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="in_progress">قيد العمل</option>
            <option value="completed">مكتمل</option>
            <option value="pending_parts">بانتظار قطع غيار</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        {/* التكلفة الإجمالية */}
        <motion.div 
          className="bg-gray-50 p-4 rounded-lg"
          animate={{ 
            scale: [1, 1.02, 1],
            transition: { duration: 0.3 }
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">التكلفة الإجمالية:</span>
            <span className="text-2xl font-bold text-blue-600">
              {calculateTotalCost()} ر.س
            </span>
          </div>
        </motion.div>

        {/* أزرار التحكم */}
        <div className="flex gap-4 justify-end mt-6">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={18} />
            <span>حفظ التغييرات</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}