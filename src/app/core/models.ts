//export type Role = 'tenant' | 'owner' | 'admin' | 'technician';
export type Role = 'admin' | 'technician' | 'owner' | 'tenant';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type TicketStatus = 'new' | 'triage' | 'assigned' | 'in_progress' | 'waiting' | 'done' | 'cancelled';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Property {
  id: string;
  code: string;
  name: string;
  campus?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  code: string;
  floor?: string;
  bedrooms?: number;
}

export interface Ticket {
  tech?: TechData;
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: TicketStatus;
  priority: TicketPriority;
  title: string;
  description?: string;
  photos?: string[];
  requesterId: string; // tenant id
  unitId?: string;
  assignedToId?: string; // technician or vendor
  slaHours?: number; // for demo, simple SLA target
  dueAt?: string; // computed from createdAt + slaHours
}

export interface DocItem {
  id: string;
  title: string;
  category: 'Lease' | 'Rules' | 'Invoice' | 'Other';
  updatedAt: string; // ISO
  url?: string; // could be external later
  content?: string; // inline text for demo
  roleAccess: Role[]; // which roles should see this doc
}

export type ApptStatus = 'requested' | 'confirmed' | 'done' | 'cancelled';

export interface Appointment {
  id: string;
  title: string;
  when: string; // ISO
  requesterId: string; // tenant id
  notes?: string;
  status: ApptStatus;
}

export interface WaitlistItem {
  id: string;
  ticketId: string;
  notes?: string;
  requestedFor?: string; // ISO
  createdAt: string;     // ISO
  priority: number;      // 1-5 (1 highest)
}

export interface CheckIn {
  id: string;
  at: string;                    // ISO timestamp
  mode: 'gps' | 'qr';
  lat?: number;
  lng?: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PartItem {
  id: string;
  name: string;
  qty: number;
  unitCost: number;
}

export interface TechData {
  translated?: boolean;
  checkins: CheckIn[];
  checklist: ChecklistItem[];
  parts: PartItem[];
  signature?: string;            // dataURL
  notes?: string;
  closedAt?: string;             // ISO
}


export type InspectionType = 'move-in' | 'move-out';
export type InspectionStatus = 'draft' | 'finalized';

export interface RoomItem {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface Inspection {
  id: string;
  type: InspectionType;
  propertyId: string;
  unitId: string;
  occupantName?: string;
  scheduledAt?: string;   // ISO
  createdAt: string;
  updatedAt: string;
  status: InspectionStatus;
  rooms: RoomItem[];
  photos?: string[];
  notes?: string;
  tenantSignature?: string;    // dataURL
  inspectorSignature?: string; // dataURL
}


export type ExpenseType = 'opex' | 'capex';

export interface Expense {
  id: string;
  propertyId: string;
  unitId?: string;
  date: string;        // ISO
  type: ExpenseType;
  category: string;
  description?: string;
  amount: number;
  evidence?: string[]; // dataURL per photo
}
