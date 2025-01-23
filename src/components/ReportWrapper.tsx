import React from 'react';

interface ReportWrapperProps {
  id: string;
  children: React.ReactNode;
  title: string;
  date?: string;
}

export function ReportWrapper({ id, children, title, date }: ReportWrapperProps) {
  return (
    <div id={id} className="bg-white p-8 rounded-lg shadow-sm">
      {/* ترويسة التقرير */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {date && <p className="text-gray-600 mt-2">تاريخ التقرير: {date}</p>}
      </div>

      {/* محتوى التقرير */}
      {children}

      {/* تذييل التقرير */}
      <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
        <p>تم إنشاء هذا التقرير بواسطة نظام إدارة الطابعات</p>
      </div>
    </div>
  );
}