import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { UsersPage } from './components/UsersPage';
import { UsersPermissionsPage } from './components/UsersPermissionsPage';
import { PrintersPage } from './components/PrintersPage';
import { SalesPage } from './components/SalesPage';
import { MaintenancePage } from './components/MaintenancePage';
import { AdminMaintenancePanel } from './components/maintenance/AdminMaintenancePanel';
import { TechnicianMaintenanceForm } from './components/maintenance/TechnicianMaintenanceForm';
import { WarehousePage } from './components/WarehousePage';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import { authService } from './services/authService';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handlePageChange = (event: CustomEvent<string>) => {
      setCurrentPage(event.detail);
    };

    window.addEventListener('pageChange', handlePageChange as EventListener);
    return () => window.removeEventListener('pageChange', handlePageChange as EventListener);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setIsAuthenticated(true);
      setCurrentUser(user);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <UsersPage />;
      case 'permissions':
        return <UsersPermissionsPage />;
      case 'printers':
        return <PrintersPage />;
      case 'sales':
        return <SalesPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'maintenance-admin':
        return <AdminMaintenancePanel 
          requests={[]} 
          technicians={[]} 
          onAssignTechnician={() => {}} 
          onStatusUpdate={() => {}} 
        />;
      case 'maintenance-technician':
        return <TechnicianMaintenanceForm 
          requestId="" 
          onClose={() => {}} 
          onSubmit={() => {}} 
        />;
      case 'warehouse':
        return <WarehousePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout} currentUser={currentUser}>
      {renderPage()}
    </Layout>
  );
}

export default App;