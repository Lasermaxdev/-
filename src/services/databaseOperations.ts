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
      // التحقق من وجود الحقول المطلوبة
      if (!printerData.model) {
        throw new Error('يجب توفير موديل الطابعة');
      }
      if (!printerData.serialNumber) {
        throw new Error('يجب توفير الرقم التسلسلي');
      }
      if (!printerData.type) {
        throw new Error('يجب تحديد نوع الطابعة');
      }
      if (!printerData.brand) {
        throw new Error('يجب تحديد العلامة التجارية');
      }
      if (!printerData.condition) {
        throw new Error('يجب تحديد حالة الطابعة');
      }

      // تحويل البيانات لتتوافق مع قاعدة البيانات
      const newPrinter = {
        id: uuidv4(),
        model: printerData.model.trim(),
        serialNumber: printerData.serialNumber.trim(),
        type: printerData.type,
        status: printerData.status || 'available',
        condition: printerData.condition,
        brand: printerData.brand.trim(),
        location: printerData.location?.trim(),
        specifications: printerData.specifications?.trim(),
        notes: printerData.notes?.trim(),
        
        // مستويات الحبر
        ink_c: parseInt(String(printerData.ink_c)),
        ink_m: parseInt(String(printerData.ink_m)),
        ink_y: parseInt(String(printerData.ink_y)),
        ink_k: parseInt(String(printerData.ink_k)),
        ink_bw: parseInt(String(printerData.ink_bw)),
        ink_note: printerData.ink_note?.trim(),
        
        // مستويات الدرم
        drum_c: parseInt(String(printerData.drum_c)),
        drum_m: parseInt(String(printerData.drum_m)),
        drum_y: parseInt(String(printerData.drum_y)),
        drum_k: parseInt(String(printerData.drum_k)),
        drum_bw: parseInt(String(printerData.drum_bw)),
        drum_note: printerData.drum_note?.trim(),
        
        // العدادات
        counter_bw: parseInt(String(printerData.counter_bw)) || 0,
        counter_colored: parseInt(String(printerData.counter_colored)) || 0,
               total_counter: printerData.type === 'color' 
          ? (parseInt(String(printerData.counter_bw)) || 0) + (parseInt(String(printerData.counter_colored)) || 0)
          : (parseInt(String(printerData.counter_bw)) || 0),


        // التواريخ
        purchaseDate: printerData.purchaseDate || null,
        warrantyEnd: printerData.warrantyEnd || null,
        last_maintenance_date: null,
        next_maintenance_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
        
    
      };

      // التحقق من صحة القيم العددية
      if (newPrinter.ink_c < 0 || newPrinter.ink_c > 100) throw new Error('قيمة الحبر السماوي يجب أن تكون بين 0 و 100');
      if (newPrinter.ink_m < 0 || newPrinter.ink_m > 100) throw new Error('قيمة الحبر الأرجواني يجب أن تكون بين 0 و 100');
      if (newPrinter.ink_y < 0 || newPrinter.ink_y > 100) throw new Error('قيمة الحبر الأصفر يجب أن تكون بين 0 و 100');
      if (newPrinter.ink_k < 0 || newPrinter.ink_k > 100) throw new Error('قيمة الحبر الأسود يجب أن تكون بين 0 و 100');
      if (newPrinter.ink_bw < 0 || newPrinter.ink_bw > 100) throw new Error('قيمة الحبر الأسود يجب أن تكون بين 0 و 100');

      if (newPrinter.drum_c < 0 || newPrinter.drum_c > 100) throw new Error('قيمة الدرم السماوي يجب أن تكون بين 0 و 100');
      if (newPrinter.drum_m < 0 || newPrinter.drum_m > 100) throw new Error('قيمة الدرم الأرجواني يجب أن تكون بين 0 و 100');
      if (newPrinter.drum_y < 0 || newPrinter.drum_y > 100) throw new Error('قيمة الدرم الأصفر يجب أن تكون بين 0 و 100');
      if (newPrinter.drum_k < 0 || newPrinter.drum_k > 100) throw new Error('قيمة الدرم الأسود يجب أن تكون بين 0 و 100');
      if (newPrinter.drum_bw < 0 || newPrinter.drum_bw > 100) throw new Error('قيمة الدرم الأسود يجب أن تكون بين 0 و 100');

      if (newPrinter.counter_bw < 0) throw new Error('قيمة عداد الأسود والأبيض يجب أن تكون 0 أو أكثر');
      if (newPrinter.counter_colored < 0) throw new Error('قيمة عداد الألوان يجب أن تكون 0 أو أكثر');

      const printer = await dbOperations.query('/printers', {
        method: 'POST',
        body: JSON.stringify(newPrinter)
      });

      return printer;
    } catch (error) {
      console.error('Error adding printer:', error);
      throw error instanceof Error ? error : new Error('فشل في إضافة الطابعة');
    }
  },

  async updatePrinter(id: string, updates: Partial<Printer>): Promise<void> {
    try {
      await dbOperations.query(`/printers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating printer:', error);
      throw error;
    }
  }
};

// ... باقي الكود يبقى كما هو

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