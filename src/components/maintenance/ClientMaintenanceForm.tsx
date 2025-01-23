import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, Send } from 'lucide-react';
import { useUsers, usePrinters } from '../../hooks/useDatabase';

interface ClientMaintenanceFormProps {
  clientId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ClientMaintenanceForm({ clientId, onSubmit, onCancel }: ClientMaintenanceFormProps) {
  const [formData, setFormData] = useState({
    printer_id: '',
    issue_description: '',
    priority: 'normal',
    images: [] as string[]
  });

  const { printers } = usePrinters();
  const clientPrinters = printers.filter(p => p.client_id === clientId);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      // إنشاء URLs للمعاينة
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // تحويل الصور إلى Base64
    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const imageBase64 = await Promise.all(imagePromises);
      onSubmit({ ...formData, images: imageBase64 });
    } catch (error) {
      console.error('Error processing images:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">طلب صيانة جديد</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اختيار الطابعة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الطابعة
          </label>
          <select
            name="printer_id"
            value={formData.printer_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر الطابعة</option>
            {clientPrinters.map(printer => (
              <option key={printer.id} value={printer.id}>
                {printer.model} - {printer.serialNumber}
              </option>
            ))}
          </select>
        </div>

        {/* وصف المشكلة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وصف المشكلة
          </label>
          <textarea
            name="issue_description"
            value={formData.issue_description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="يرجى وصف المشكلة بالتفصيل..."
          />
        </div>

        {/* مستوى الأولوية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مستوى الأولوية
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">عادي</option>
            <option value="normal">متوسط</option>
            <option value="high">عاجل</option>
            <option value="urgent">طارئ</option>
          </select>
        </div>

        {/* رفع الصور */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            صور المشكلة (اختياري)
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-2 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>رفع صور</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* معاينة الصور */}
          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                      setImageFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <AlertCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-4 justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={18} />
            <span>إرسال الطلب</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}