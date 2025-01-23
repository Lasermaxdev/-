import React from 'react';
import { Bell, Shield, Database, Globe, Settings as SettingsIcon } from 'lucide-react';
import { SystemSettings } from '../types';

const settings: SystemSettings[] = [
  {
    id: '1',
    key: 'company_name',
    value: 'شركة الطابعات المتقدمة',
    category: 'general',
    description: 'اسم الشركة الظاهر في التقارير والفواتير',
  },
  {
    id: '2',
    key: 'low_stock_threshold',
    value: '10',
    category: 'notifications',
    description: 'الحد الأدنى للمخزون لإرسال التنبيهات',
  },
  {
    id: '3',
    key: 'session_timeout',
    value: '30',
    category: 'security',
    description: 'مدة الجلسة بالدقائق قبل تسجيل الخروج التلقائي',
  },
  {
    id: '4',
    key: 'backup_frequency',
    value: 'daily',
    category: 'backup',
    description: 'تكرار النسخ الاحتياطي التلقائي',
    options: [
      { value: 'daily', label: 'يومي' },
      { value: 'weekly', label: 'أسبوعي' }
    ]
  },
];

const categoryIcons = {
  general: Globe,
  notifications: Bell,
  security: Shield,
  backup: Database,
};

const categoryLabels = {
  general: 'إعدادات عامة',
  notifications: 'التنبيهات',
  security: 'الأمان',
  backup: 'النسخ الاحتياطي',
};

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(categoryLabels).map(([category, label]) => {
          const Icon = categoryIcons[category];
          const categorySettings = settings.filter(
            (setting) => setting.category === category
          );

          return (
            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-lg bg-${category === 'general' ? 'blue' : category === 'notifications' ? 'yellow' : category === 'security' ? 'red' : 'green'}-100`}>
                  <Icon className={`h-6 w-6 text-${category === 'general' ? 'blue' : category === 'notifications' ? 'yellow' : category === 'security' ? 'red' : 'green'}-700`} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
              </div>

              <div className="space-y-4">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <label
                      htmlFor={setting.key}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {setting.description}
                    </label>
                    {setting.options ? (
                      <select
                        id={setting.key}
                        name={setting.key}
                        defaultValue={setting.value}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {setting.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id={setting.key}
                        name={setting.key}
                        defaultValue={setting.value}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  حفظ التغييرات
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}