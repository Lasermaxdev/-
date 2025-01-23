import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Save, AlertCircle, CheckCircle2, User2, Settings2, Package, Printer, ShoppingCart, Wrench, FileText } from 'lucide-react';
import { permissionsService } from '../services/permissionsService';
import { LoadingSpinner } from './LoadingSpinner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionsManagerProps {
  userId: string;
  onSave?: () => void;
}

const permissionCategories = {
  users: { label: 'إدارة المستخدمين', icon: User2, color: 'from-blue-500 to-blue-600' },
  printers: { label: 'إدارة الطابعات', icon: Printer, color: 'from-purple-500 to-purple-600' },
  sales: { label: 'المبيعات', icon: ShoppingCart, color: 'from-green-500 to-green-600' },
  maintenance: { label: 'الصيانة', icon: Wrench, color: 'from-yellow-500 to-yellow-600' },
  inventory: { label: 'المخزون', icon: Package, color: 'from-red-500 to-red-600' },
  reports: { label: 'التقارير', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
  settings: { label: 'الإعدادات', icon: Settings2, color: 'from-gray-500 to-gray-600' }
};

export function PermissionsManager({ userId, onSave }: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userId) {
      loadPermissions();
    }
  }, [userId]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // جلب جميع الصلاحيات المتاحة
      const allPermissions = await permissionsService.getAllPermissions();
      
      // جلب صلاحيات المستخدم المحددة
      const userPermissions = await permissionsService.getUserPermissions(userId);
      
      // تنظيم الصلاحيات حسب الفئات
      const organizedPermissions = allPermissions.map(permission => ({
        ...permission,
        category: permission.name.split(':')[0]
      }));

      setPermissions(organizedPermissions);
      setSelectedPermissions(userPermissions.map(p => p.id));
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('فشل في تحميل الصلاحيات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (category: string) => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);
    
    const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissions.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissions])]);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await permissionsService.updateUserPermissions(userId, selectedPermissions);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSave?.();
    } catch (err) {
      setError('فشل في حفظ الصلاحيات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!permissions.length) {
    return (
      <div className="text-center p-8">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد صلاحيات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5" />
            <p>تم حفظ الصلاحيات بنجاح</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permissions Grid */}
      <div className="space-y-6">
        {Object.entries(permissionCategories).map(([category, { label, icon: Icon, color }]) => {
          const categoryPermissions = permissions.filter(p => p.category === category);
          if (!categoryPermissions.length) return null;

          const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.id));
          const someSelected = categoryPermissions.some(p => selectedPermissions.includes(p.id));

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900">{label}</h3>
                </div>
                <button
                  onClick={() => handleSelectAll(category)}
                  className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                    allSelected
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {categoryPermissions.map(permission => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:bg-white p-3 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                    <span className="select-none">{permission.description}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}</span>
        </motion.button>
      </div>
    </div>
  );
}