import React from 'react';
import { FileDown } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

interface ExportButtonProps {
  elementId: string;
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
}

export function ExportButton({ elementId, fileName, orientation }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      await exportToPDF(elementId, fileName, orientation);
    } catch (error) {
      alert('حدث خطأ أثناء تصدير التقرير');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
    >
      <FileDown size={20} />
      <span>تصدير PDF</span>
    </button>
  );
}