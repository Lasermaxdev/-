import { useState, useEffect } from 'react';
import { userOperations, printerOperations, salesOperations, maintenanceOperations, inventoryOperations } from '../services/databaseOperations';
import { User, Printer, Sale, MaintenanceRequest, InventoryItem } from '../types';

// Users hook
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userOperations.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('فشل في تحميل المستخدمين');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      await userOperations.addUser(userData);
      await loadUsers();
      return true;
    } catch (err) {
      setError('فشل في إضافة المستخدم');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return { 
    users, 
    isLoading, 
    error, 
    addUser,
    reloadUsers: loadUsers 
  };
}

// Printers hook
export function usePrinters() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrinters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await printerOperations.getAllPrinters();
      setPrinters(data);
    } catch (err) {
      setError('فشل في تحميل الطابعات');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addPrinter = async (printerData: Partial<Printer>) => {
    setIsLoading(true);
    setError(null);
    try {
      await printerOperations.addPrinter(printerData);
      await loadPrinters();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إضافة الطابعة');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrinter = async (id: string, updates: Partial<Printer>) => {
    setIsLoading(true);
    setError(null);
    try {
      await printerOperations.updatePrinter(id, updates);
      await loadPrinters();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الطابعة');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  return { 
    printers, 
    isLoading, 
    error, 
    addPrinter,
    updatePrinter,
    reloadPrinters: loadPrinters 
  };
}

// Sales hook
export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await salesOperations.getAllSales();
      setSales(data);
    } catch (err) {
      setError('فشل في تحميل المبيعات');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addSale = async (saleData: Partial<Sale>) => {
    setIsLoading(true);
    setError(null);
    try {
      await salesOperations.addSale(saleData);
      await loadSales();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إضافة عملية البيع');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return { 
    sales, 
    isLoading, 
    error, 
    addSale,
    reloadSales: loadSales 
  };
}

// Maintenance Requests hook
export function useMaintenanceRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await maintenanceOperations.getAllMaintenanceRequests();
      setRequests(data);
    } catch (err) {
      setError('فشل في تحميل طلبات الصيانة');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addRequest = async (requestData: Partial<MaintenanceRequest>) => {
    setIsLoading(true);
    setError(null);
    try {
      await maintenanceOperations.addMaintenanceRequest(requestData);
      await loadRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إضافة طلب الصيانة');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return { 
    requests, 
    isLoading, 
    error, 
    addRequest,
    reloadRequests: loadRequests 
  };
}

// Inventory hook
export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryOperations.getAllItems();
      setItems(data);
    } catch (err) {
      setError('فشل في تحميل المخزون');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (itemData: Partial<InventoryItem>) => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryOperations.addItem(itemData);
      await loadItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إضافة الصنف');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryOperations.updateItem(id, updates);
      await loadItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الصنف');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return { 
    items, 
    isLoading, 
    error, 
    addItem,
    updateItem,
    reloadItems: loadItems 
  };
}