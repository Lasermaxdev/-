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
  parts_used?: string;
  cost?: number;
  created_at: string;
  updated_at: string;
  description?: string;
  
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
