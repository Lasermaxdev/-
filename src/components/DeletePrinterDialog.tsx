import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeletePrinterDialogProps {
  printerModel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePrinterDialog({ printerModel, onConfirm, onCancel }: DeletePrinterDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">تأكيد الحذف</h2>
        </div>

        <p className="text-gray-600 mb-6">
          هل أنت متأكد من حذف الطابعة "{printerModel}"؟ لا يمكن التراجع عن هذا الإجراء.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            نعم، احذف الطابعة
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}