import React, { useState } from 'react';
import { Menu, User2, Printer, ShoppingCart, Wrench, Package, BarChart3, Settings, Globe, LogOut, Shield, PenTool as Tool, Users, ClipboardList } from 'lucide-react';
import { MenuItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentUser: any;
}

export function Layout({ children, onLogout, currentUser }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('ar');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems: MenuItem[] = [
    { title: 'لوحة التحكم', icon: BarChart3, href: 'dashboard' },
    { title: 'المستخدمين', icon: User2, href: 'users' },
    { title: 'الصلاحيات', icon: Shield, href: 'permissions' },
    { title: 'الطابعات', icon: Printer, href: 'printers' },
    { title: 'المبيعات', icon: ShoppingCart, href: 'sales' },
    // تحديث قسم الصيانة
    { 
      title: 'الصيانة', 
      icon: Wrench, 
      href: 'maintenance',
      subItems: [
        { title: 'طلبات الصيانة', icon: ClipboardList, href: 'maintenance' },
        { title: 'لوحة التحكم', icon: Tool, href: 'maintenance-admin' },
        { title: 'نموذج الفني', icon: Users, href: 'maintenance-technician' }
      ]
    },
    { title: 'المخزن', icon: Package, href: 'warehouse' },
    { title: 'الإعدادات', icon: Settings, href: 'settings' },
  ];

  const handlePageChange = (href: string) => {
    window.history.pushState({}, '', `/${href}`);
    setCurrentPage(href);
    const event = new CustomEvent('pageChange', { detail: href });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1) || 'dashboard';
      setCurrentPage(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">نظام إدارة الطابعات</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
              <Menu size={24} />
            </button>
          </div>
          
          <nav>
            {menuItems.map((item) => (
              <div key={item.title}>
                <button
                  onClick={() => handlePageChange(item.href)}
                  className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mb-1 w-full ${
                    currentPage === item.href ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </button>
                
                {/* القائمة الفرعية للصيانة */}
                {item.subItems && (
                  <div className="mr-6 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.href}
                        onClick={() => handlePageChange(subItem.href)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg w-full ${
                          currentPage === subItem.href ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <subItem.icon size={16} />
                        <span>{subItem.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ease-in-out ${sidebarOpen ? 'mr-64' : 'mr-0'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                <Menu size={24} />
              </button>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <Globe size={20} />
                  <span>{currentLanguage.toUpperCase()}</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="h-10 w-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors relative"
                  >
                    <User2 size={20} className="text-blue-600" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg py-2 z-50"
                      >
                        {currentUser && (
                          <>
                            <div className="px-4 py-2 border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                              <p className="text-xs text-gray-500">{currentUser.email}</p>
                            </div>
                            <button
                              onClick={onLogout}
                              className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <LogOut size={16} />
                              <span>تسجيل الخروج</span>
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}