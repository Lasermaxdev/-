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
  cost?: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  technician?: {
    name: string;
  };
  parts?: Array<{
    part: {
      name: string;
      sku: string;
    };
    quantity: number;
    unit_price: number;
  }>;
}

export interface MaintenanceStats {
  totalRequests: number;
  completedRequests: number;
  totalCost: number;
  averageResponseTime: number;
  lastMaintenanceDate: string | null;
  nextScheduledMaintenance: string | null;
}