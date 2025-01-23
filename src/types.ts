import { User, Printer, Sale, MaintenanceRequest, InventoryItem } from '../types';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'employee' | 'client';
  department?: Department;
  phone?: string;
  startDate?: string;
  jobTitle?: string;
  company?: string;
  address?: string;
  lastActive?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Printer {
  id: string;
  model: string;
  serialNumber: string;
  type: 'color' | 'bw';
  status: 'available' | 'rented' | 'maintenance' | 'sold';
  condition: 'new' | 'used' | 'refurbished';
  brand: string;
  location?: string;
  specifications?: string;
  notes?: string;
  
  // مستويات الحبر
  ink_c?: number;
  ink_m?: number;
  ink_y?: number;
  ink_k?: number;
  ink_bw?: number;
  ink_note?: string;
  
  // مستويات الدرم
  drum_c?: number;
  drum_m?: number;
  drum_y?: number;
  drum_k?: number;
  drum_bw?: number;
  drum_note?: string;
  
  // العدادات
  counter_bw: number;
  counter_colored?: number;
  total_counter?: number;
  
  // التواريخ
  purchaseDate?: string;
  warrantyEnd?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  created_at?: string;
  updated_at?: string;




}

export interface Sale {
  id: string;
  type: 'sale' | 'rental';
  printer_id: string;
  client_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  rental_start_date?: string;
  rental_end_date?: string;
  rental_period?: number;
  invoice_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  printer_model?: string;
  client_name?: string;
}

export interface MaintenanceRequest {
  id: string;
  printerId: string;
  clientId: string;
  technicianId?: string;
  issue: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  completionDate?: string;
  diagnosis?: string;
  solution?: string;
  partsUsed?: string;
  cost?: number;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  printer_model?: string;
  client_name?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'ink' | 'spare' | 'paper';
  brand?: string;
  modelCompatibility?: string;
  quantity: number;
  minQuantity: number;
  costPrice?: number;
  sellingPrice?: number;
  location?: string;
  supplier?: string;
  lastRestockDate?: string;
  created_at?: string;
  updated_at?: string;
}

export type Department = 'sales' | 'accounting' | 'maintenance' | 'warehouse';

export interface MenuItem {
  title: string;
  icon: React.ComponentType;
  href: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'notifications' | 'security' | 'backup';
  description: string;

export interface MenuItem {
  title: string;
  icon: any;
  href: string;
  subItems?: {
    title: string;
    icon: any;
    href: string;
  }[];
}



// Add to existing types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'employee' | 'client';
  department?: Department;
  phone?: string;
  startDate?: string;
  jobTitle?: string;
  company?: string;
  address?: string;
  lastActive?: string;
  isOnline?: boolean;
  lastPing?: string;
  created_at?: string;
  updated_at?: string;
}
  options?: Array<{ value: string; label: string }>;
}

export interface MaintenanceRequest {
  id: string;
  printer_id: string;
  client_id: string;
  technician_id?: string;
  issue: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  completion_date?: string;
  diagnosis?: string;
  solution?: string;
  parts_used?: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
  }>;
  cost?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  
  // العلاقات
  printer?: {
    model: string;
    serial_number: string;
  };
  client?: {
    name: string;
    company?: string;
  };
  technician?: {
    name: string;
  };
}

// ... باقي التعريفات