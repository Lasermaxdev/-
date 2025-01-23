import { User, Printer, Sale, MaintenanceRequest, InventoryItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { dbOperations } from '../config/database';

export const userOperations = {
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await dbOperations.query('/users');
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async addUser(userData: Partial<User>): Promise<User> {
    try {
      const newUser = {
        id: uuidv4(),
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const user = await dbOperations.query('/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });

      return user;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }
};

export const printerOperations = {
  async getAllPrinters(): Promise<Printer[]> {
    try {
      const printers = await dbOperations.query('/printers');
      return printers;
    } catch (error) {
      console.error('Error getting printers:', error);
      return [];
    }
  },

  async addPrinter(printerData: Partial<Printer>): Promise<Printer> {
    try {
      // تحويل أسماء الحقول لتتطابق مع قاعدة البيانات
      const newPrinter = {
        id: uuidv4(),
        model: printerData.model,
        serialNumber: printerData.serialNumber,
        type: printerData.type,
        status: 'available',
        condition: printerData.condition,
        brand: printerData.brand,
        purchaseDate: printerData.purchaseDate,
        warrantyEnd: printerData.warrantyEnd,
        location: printerData.location,
        counter_bw: printerData.counter_black,
        counter_color: printerData.counter_color,
        notes: printerData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const printer = await dbOperations.query('/printers', {
        method: 'POST',
        body: JSON.stringify(newPrinter)
      });

      return printer;
    } catch (error) {
      console.error('Error adding printer:', error);
      throw new Error('فشل في إضافة الطابعة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    }
  },

  async updatePrinter(id: string, updates: Partial<Printer>): Promise<void> {
    try {
      await dbOperations.query(`/printers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Error updating printer:', error);
      throw error;
    }
  }
};

export const salesOperations = {
  async getAllSales(): Promise<Sale[]> {
    try {
      const sales = await dbOperations.query('/sales');
      return sales;
    } catch (error) {
      console.error('Error getting sales:', error);
      return [];
    }
  },

  async addSale(saleData: Partial<Sale>): Promise<Sale> {
    try {
      const newSale = {
        id: uuidv4(),
        ...saleData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sale = await dbOperations.query('/sales', {
        method: 'POST',
        body: JSON.stringify(newSale)
      });

      return sale;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  }
};

export const maintenanceOperations = {
  async getAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    try {
      const requests = await dbOperations.query('/maintenance');
      return requests;
    } catch (error) {
      console.error('Error getting maintenance requests:', error);
      return [];
    }
  },

  async addMaintenanceRequest(requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    try {
      const newRequest = {
        id: uuidv4(),
        ...requestData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const request = await dbOperations.query('/maintenance', {
        method: 'POST',
        body: JSON.stringify(newRequest)
      });

      return request;
    } catch (error) {
      console.error('Error adding maintenance request:', error);
      throw error;
    }
  }
};

export const inventoryOperations = {
  async getAllItems(): Promise<InventoryItem[]> {
    try {
      const items = await dbOperations.query('/inventory');
      return items;
    } catch (error) {
      console.error('Error getting inventory items:', error);
      return [];
    }
  },

  async addItem(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const newItem = {
        id: uuidv4(),
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const item = await dbOperations.query('/inventory', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });

      return item;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  },

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      await dbOperations.query(`/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }
};