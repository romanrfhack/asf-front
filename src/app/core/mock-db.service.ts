import { Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Ticket, TicketPriority, TicketStatus, Property, Unit, User, DocItem, Appointment, WaitlistItem, ChecklistItem, Inspection, RoomItem, Expense } from './models';

const KEY = 'asfm.db.v1';

export interface MockDb {
  users: User[];
    properties: Property[];
  units: Unit[];
  tickets: Ticket[];
  docs: DocItem[];
  appointments: Appointment[];
  waitlist: WaitlistItem[];
  inspections: Inspection[];
  expenses: Expense[];
}

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10);
}

function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3600_000).toISOString();
}

function seed(): MockDb {
  const now = new Date().toISOString();
  const admin: User = { id: uid('u_'), name: 'Alex Admin', role: 'admin' };
  const tenant: User = { id: uid('u_'), name: 'Taylor Tenant', role: 'tenant' };
  const owner: User = { id: uid('u_'), name: 'Olivia Owner', role: 'owner' };
  const tech: User = { id: uid('u_'), name: 'Terry Technician', role: 'technician' };

  const prop: Property = { id: uid('p_'), code: 'HALL-A', name: 'Hall A', campus: 'Main' };
  const unit101: Unit = { id: uid('un_'), propertyId: prop.id, code: '101', floor: '1', bedrooms: 2 };
  const unit102: Unit = { id: uid('un_'), propertyId: prop.id, code: '102', floor: '1', bedrooms: 2 };


  const docs: DocItem[] = [
    { id: uid('d_'), title: 'Lease Agreement 2025', category: 'Lease', updatedAt: now, roleAccess: ['tenant', 'owner'], content: 'Lease terms for 2025. Lorem ipsum…' },
    { id: uid('d_'), title: 'Community Rules', category: 'Rules', updatedAt: now, roleAccess: ['tenant', 'owner'], content: 'No loud noise after 10pm. Pets allowed with registration…' },
    { id: uid('d_'), title: 'Owner Handbook', category: 'Other', updatedAt: now, roleAccess: ['owner'], content: 'Guidelines for owners about maintenance processes…' }
  ];

  const appointments: Appointment[] = [
    { id: uid('a_'), title: 'Move-in walk-through', when: addHours(now, 72), requesterId: tenant.id, status: 'confirmed' },
  ];



  const inspections: Inspection[] = [{
    id: uid('i_'),
    type: 'move-in',
    propertyId: prop.id,
    unitId: unit101.id,
    occupantName: 'Taylor Tenant',
    createdAt: now,
    updatedAt: now,
    scheduledAt: addHours(now, 24),
    status: 'draft',
    rooms: [
      { id: uid('r_'), name: 'Living Room', items: [
        { id: uid('c_'), text: 'Walls clean', done: false },
        { id: uid('c_'), text: 'Windows intact', done: false },
        { id: uid('c_'), text: 'Lights working', done: false }
      ]},
      { id: uid('r_'), name: 'Kitchen', items: [
        { id: uid('c_'), text: 'Sink no leaks', done: false },
        { id: uid('c_'), text: 'Stove works', done: false }
      ]}
    ],
    photos: []
  }];


  const expenses: Expense[] = [
    { id: uid('e_'), propertyId: prop.id, date: now, type: 'opex', category: 'HVAC', description: 'Filter replacement', amount: 85.50 },
    { id: uid('e_'), propertyId: prop.id, date: now, type: 'capex', category: 'Renovation', description: 'Kitchen cabinets', amount: 1250.00 }
  ];

  const waitlist: WaitlistItem[] = [
    { id: uid('w_'), ticketId: 'TBD', notes: 'Schedule when part arrives', createdAt: now, priority: 3 }
  ];

  const tickets: Ticket[] = [
    {
      id: uid('t_'),
      createdAt: now,
      updatedAt: now,
      status: 'new',
      priority: 'high',
      title: 'Air conditioner not cooling',
      description: 'Feels warm even when set to 18°C',
      requesterId: tenant.id,
      unitId: unit101.id,
      slaHours: 24,
      dueAt: addHours(now, 24),
    },
    {
      id: uid('t_'),
      createdAt: now,
      updatedAt: now,
      status: 'in_progress',
      priority: 'medium',
      title: 'Leaking faucet in bathroom',
      tech: { checkins: [], checklist: [
        { id: uid('c_'), text: 'Shut off water supply', done: false },
        { id: uid('c_'), text: 'Disassemble faucet', done: false },
        { id: uid('c_'), text: 'Replace worn washers', done: false },
        { id: uid('c_'), text: 'Test for leaks', done: false }
      ], parts: [] },
      requesterId: tenant.id,
      unitId: unit102.id,
      assignedToId: tech.id,
      slaHours: 48,
      dueAt: addHours(now, 48),
    }
  ];

  return {
    users: [admin, tenant, owner, tech],
    properties: [prop],
    units: [unit101, unit102],
    tickets,
    docs,
    appointments,
    waitlist,
    inspections,
    expenses
  };
}

@Injectable({ providedIn: 'root' })
export class MockDbService {
  db = signal<MockDb>(seed());

  constructor(private ls: LocalStorageService) {
    const saved = this.ls.getJSON<MockDb | null>(KEY, null);
    if (saved) {
      this.db.set(saved);
    } else {
      this.persist();
    }
  }

  private persist() {
    this.ls.setJSON(KEY, this.db());
  }

  reset() {
    this.db.set(seed());
    this.persist();
  }

  // Tickets
  getTicket(id: string) { return this.db().tickets.find(t => t.id === id) || null; }

  listTicketsForTechnician(userId: string) {
    return this.db().tickets.filter(t => t.assignedToId === userId || (t.status === 'in_progress' && t.assignedToId === userId));
  }

  private updateTicket(id: string, mut: (t: Ticket) => void) {
    this.db.update(s => {
      const idx = s.tickets.findIndex(x => x.id === id);
      if (idx >= 0) { const copy = { ...s.tickets[idx] }; mut(copy); s.tickets[idx] = copy; }
      return s;
    });
    this.persist();
  }

  addCheckIn(ticketId: string, mode: 'gps'|'qr', lat?: number, lng?: number) {
    const item = { id: uid('ci_'), at: new Date().toISOString(), mode, lat, lng };
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.checkins.push(item as any);
      if (t.status === 'assigned') t.status = 'in_progress';
      t.updatedAt = new Date().toISOString();
    });
  }

  addChecklistItem(ticketId: string, text: string) {
    const item = { id: uid('c_'), text, done: false } as ChecklistItem;
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.checklist.push(item);
    });
  }

  toggleChecklistItem(ticketId: string, itemId: string) {
    this.updateTicket(ticketId, t => {
      if (!t.tech) return;
      const idx = t.tech.checklist.findIndex(c => c.id === itemId);
      if (idx >= 0) t.tech.checklist[idx] = { ...t.tech.checklist[idx], done: !t.tech.checklist[idx].done };
    });
  }

  addPhoto(ticketId: string, dataUrl: string) {
    this.updateTicket(ticketId, t => {
      if (!t.photos) t.photos = [];
      t.photos.push(dataUrl);
    });
  }

  addPart(ticketId: string, name: string, qty: number, unitCost: number) {
    const item = { id: uid('p_'), name, qty, unitCost };
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.parts.push(item as any);
    });
  }

  removePart(ticketId: string, partId: string) {
    this.updateTicket(ticketId, t => {
      if (!t.tech) return;
      t.tech.parts = t.tech.parts.filter(p => p.id !== partId);
    });
  }

  setSignature(ticketId: string, dataUrl: string) {
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.signature = dataUrl;
    });
  }

  setTechNotes(ticketId: string, notes: string) {
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.notes = notes;
    });
  }


  setTechTranslated(ticketId: string, flag: boolean) {
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.translated = flag;
    });
  }

  completeTicket(ticketId: string) {
    const now = new Date().toISOString();
    this.updateTicket(ticketId, t => {
      if (!t.tech) t.tech = { checkins: [], checklist: [], parts: [] };
      t.tech.closedAt = now;
      t.status = 'done';
      t.updatedAt = now;
    });
  }

  listTickets() { return this.db().tickets; }
  byStatus(status: TicketStatus) {
    return this.db().tickets.filter(t => t.status === status);
  }
  upsertTicket(partial: Partial<Ticket> & { title: string }): Ticket {
    const now = new Date().toISOString();
    let t: Ticket;
    if (partial.id) {
      const idx = this.db().tickets.findIndex(x => x.id === partial.id);
      if (idx >= 0) {
        t = { ...this.db().tickets[idx], ...partial, updatedAt: now };
        this.db.update((s: MockDb) => { s.tickets[idx] = t; return s; });
        this.persist();
        return t;
      }
    }
    t = {
      id: uid('t_'),
      createdAt: now,
      updatedAt: now,
      status: (partial as any).status ?? 'new',
      priority: (partial as any).priority ?? 'medium',
      title: partial.title,
      description: partial.description ?? '',
      requesterId: (partial as any).requesterId ?? this.db().users.find(u => u.role === 'tenant')!.id,
      unitId: (partial as any).unitId,
      slaHours: (partial as any).slaHours ?? 48,
      dueAt: addHours(now, (partial as any).slaHours ?? 48),
    };
    this.db.update((s: MockDb) => { s.tickets.unshift(t); return s; });
    this.persist();    
    return t;
  }

  // Assignments & Waitlist
  // Expenses / CAPEX
  listExpensesByProperty(propertyId: string) { return this.db().expenses.filter(e => e.propertyId === propertyId); }
  addExpense(exp: Omit<Expense, 'id'|'evidence'>) {
    const e: Expense = { ...exp, id: uid('e_'), evidence: [] };
    this.db.update((s: MockDb) => { s.expenses.unshift(e); return s; });
    this.persist();
    return e;
  }
  addExpenseEvidence(expenseId: string, dataUrl: string) {
    this.db.update((s: MockDb) => {
      const e = s.expenses.find(x => x.id === expenseId);
      if (e) { (e.evidence ||= []).push(dataUrl); }
      return s;
    });
    this.persist();
  }
  removeExpense(expenseId: string) {
    this.db.update((s: MockDb) => {
      s.expenses = s.expenses.filter((e: Expense) => e.id !== expenseId);
      return s;
    });
    this.persist();
  }
  totalByType(propertyId: string) {
    const exps = this.listExpensesByProperty(propertyId);
    return exps.reduce((acc, e) => { acc[e.type] = (acc[e.type]||0) + (e.amount||0); return acc; }, { opex: 0, capex: 0 } as any);
  }
  openTicketsByProperty(propertyId: string) {
    return this.db().tickets.filter(t => !['done','cancelled'].includes(t.status) && (!!t.unitId && this.db().units.find(u => u.id===t.unitId)?.propertyId===propertyId)).length;
  }
  unitsByProperty(propertyId: string) {
    return this.db().units.filter(u => u.propertyId === propertyId).length;
  }

  assignTicket(ticketId: string, userId: string) {
    const now = new Date().toISOString();
    this.db.update(s => {
      const idx = s.tickets.findIndex(t => t.id === ticketId);
      if (idx >= 0) s.tickets[idx] = { ...s.tickets[idx], assignedToId: userId, status: 'assigned', updatedAt: now };
      return s;
    });
    this.persist();
  }
  addToWaitlist(ticketId: string, notes = '', requestedFor?: string, priority = 3) {
    const w: WaitlistItem = { id: uid('w_'), ticketId, notes, requestedFor, createdAt: new Date().toISOString(), priority };
    this.db.update(s => { s.waitlist.unshift(w); return s; });
    this.persist();
    return w;
  }
  listWaitlist() { return this.db().waitlist; }
  removeWaitlist(id: string) {
    this.db.update(s => {
      s.waitlist = s.waitlist.filter((w: WaitlistItem) => w.id !== id);
      return s;
    });
    this.persist();
  }

  moveTicket(id: string, status: TicketStatus) {
    const now = new Date().toISOString();
    this.db.update((s: MockDb) => {
      const idx = s.tickets.findIndex(t => t.id === id);
      if (idx >= 0) {
        s.tickets[idx] = { ...s.tickets[idx], status, updatedAt: now };
      }
      return s;
    });
    this.persist();
  }


  // Docs
  listDocsForRole(role: User['role']) {
    return this.db().docs.filter(d => d.roleAccess.includes(role));
  }
  getDoc(id: string) { return this.db().docs.find(d => d.id === id) || null; }

  // Appointments
  listAppointmentsForUser(userId: string) {
    return this.db().appointments.filter(a => a.requesterId === userId);
  }
  addAppointment(partial: Partial<Appointment> & { title: string; when: string; requesterId?: string }): Appointment {
    const a: Appointment = {
      id: uid('a_'),
      title: partial.title,
      when: partial.when,
      requesterId: partial.requesterId ?? this.db().users.find(u => u.role === 'tenant')!.id,
      notes: partial.notes ?? '',
      status: 'requested'
    };
    this.db.update(s => { s.appointments.unshift(a); return s; });
    this.persist();
    return a;
  }
  setAppointmentStatus(id: string, status: Appointment['status']) {
    this.db.update(s => {
      const idx = s.appointments.findIndex((x: Appointment) => x.id === id);
      if (idx >= 0) s.appointments[idx].status = status;
      return s;
    });
    this.persist();
  }


  // ===== Inspections =====
listInspections() {
  // Devuelve todas las inspecciones (draft y finalized)
  return (this.db().inspections ?? []);
}

getInspection(id: string) {
  // Útil para el detalle (InspectionWizardComponent)
  return this.db().inspections?.find(i => i.id === id) || null;
}

addInspection(partial: Partial<Inspection> & { type: 'move-in' | 'move-out' }): Inspection {
  // Usado por InspectionsListComponent.create(...)
  const now = new Date().toISOString();
  const fallbackProp = this.db().properties?.[0]?.id;
  const fallbackUnit = this.db().units?.[0]?.id;

  const ins: Inspection = {
    id: uid('i_'),
    type: partial.type,
    propertyId: partial.propertyId || fallbackProp || '',
    unitId: partial.unitId || fallbackUnit || '',
    occupantName: partial.occupantName || '',
    scheduledAt: partial.scheduledAt,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    rooms: (partial as any).rooms || [],   // si no pasas rooms, queda vacío
    photos: [],
    notes: ''
  };

  this.db.update((s: MockDb) => {
    s.inspections = [ins, ...(s.inspections || [])];
    return s;
  });
  this.persist();
  return ins;
}

updateInspection(id: string, patch: Partial<Inspection>) {  
  const now = new Date().toISOString();
  this.db.update((s: MockDb) => {
    const arr = s.inspections || (s.inspections = []);
    const idx = arr.findIndex((i: Inspection) => i.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...patch, updatedAt: now };
    }
    return s;
  });
  this.persist();
}

addInspectionPhoto(id: string, dataUrl: string) {
  this.db.update(s => {
    const ins = s.inspections?.find(i => i.id === id);
    if (!ins) return s;
    (ins.photos ||= []).push(dataUrl);
    ins.updatedAt = new Date().toISOString();
    return s;
  });
  this.persist();
  this.persist();
}

finalizeInspection(id: string) {
  // Cambia el estado a 'finalized' (botón Finalize del wizard)
  this.updateInspection(id, { status: 'finalized' });
}



  // Lookups
  usersByRole(role: User['role']) { return this.db().users.filter(u => u.role === role); }
  units() { return this.db().units; }
  properties() { return this.db().properties; }
}
