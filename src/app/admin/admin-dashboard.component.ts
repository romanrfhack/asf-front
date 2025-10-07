import { Component, computed, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe, CurrencyPipe, NgClass, CommonModule } from '@angular/common';
import { MockDbService } from '../core/mock-db.service';

type Bucket = '0-1d'|'1-3d'|'3-7d'|'7d+';
type PriorityKey = string;  // ej. 'low' | 'medium' | 'high' | 'urgent' (flexible)

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [NgFor, CommonModule, NgIf, DatePipe, CurrencyPipe],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  // rango temporal para KPIs (7, 30, 90 días)
  rangeDays = signal<number>(30);
  now = signal<Date>(new Date());

  constructor(private db: MockDbService) {}

  private startOfRange() {
    const d = new Date(this.now().getTime() - this.rangeDays()*86400000);
    d.setHours(0,0,0,0);
    return d;
  }
  private endOfRange() {
    const d = new Date(); d.setHours(23,59,59,999); return d;
  }
  private inRange(iso?: string) {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= this.startOfRange().getTime() && t <= this.endOfRange().getTime();
  }

  // colecciones
  properties = computed(() => this.db.properties());
  units = computed(() => this.db.units());
  ticketsAll = computed(() => this.db.listTickets());
  openTickets = computed(() => this.ticketsAll().filter(t => !['done','cancelled'].includes(t.status)));
  closedTicketsInRange = computed(() => this.ticketsAll().filter(t => t.status === 'done' && this.inRange(t.updatedAt)));
  openedTicketsInRange = computed(() => this.ticketsAll().filter(t => this.inRange(t.createdAt)));

  // Expenses (tomamos todas; si tienes helpers, puedes usarlos)
  expensesInRange = computed(() => {
    const store: any = (this.db as any).db?.() || (this.db as any).db();
    const arr = (store.expenses || []) as any[];
    return arr.filter(e => this.inRange(e.date));
  });

  // KPI principales
  totalProperties = computed(() => this.properties().length);
  activeTickets = computed(() => this.openTickets().length);

  slaPct = computed(() => {
    const closed = this.closedTicketsInRange();
    if (!closed.length) return 100;
    const ontime = closed.filter(t => t.dueAt && new Date(t.updatedAt) <= new Date(t.dueAt)).length;
    return Math.round((ontime / closed.length) * 100);
  });

  monthlyCosts = computed(() =>
    this.expensesInRange().reduce((acc, e: any) => acc + (e.amount || 0), 0)
  );

  avgTurnaroundDays = computed(() => {
    const closed = this.closedTicketsInRange();
    if (!closed.length) return 0;
    const hours = closed.map(t => (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime())/3600000);
    return Math.round((hours.reduce((a,b)=>a+b,0)/hours.length)/24*10)/10; // 1 decimal en días
  });

  atRiskSLA = computed(() => {
    const now = this.now().getTime();
    const next24 = now + 24*3600000;
    return this.openTickets().filter(t => {
      const due = t.dueAt ? new Date(t.dueAt).getTime() : NaN;
      return !isNaN(due) && due <= next24; // incluye overdue y los que vencen <24h
    }).length;
  });

  // distribución por antigüedad (aging)
  agingBuckets = computed(() => {
    const b: Record<Bucket, number> = { '0-1d':0,'1-3d':0,'3-7d':0,'7d+':0 };
    const now = this.now().getTime();
    for (const t of this.openTickets()) {
      const age = Math.floor((now - new Date(t.createdAt).getTime())/86400000);
      if (age <= 1) b['0-1d']++;
      else if (age <= 3) b['1-3d']++;
      else if (age <= 7) b['3-7d']++;
      else b['7d+']++;
    }
    return b;
  });

  // pipeline por estatus (simple)
  pipeline = computed(() => {
    const all = this.ticketsAll();
    const count = (s: string) => all.filter(t => t.status === s).length;
    // ajusta los estatus a los que uses realmente
    return [
      { key: 'new',          label: 'New',          value: count('new') },
      { key: 'assigned',     label: 'Assigned',     value: count('assigned') },
      { key: 'in_progress',  label: 'In Progress',  value: count('in_progress') },
      { key: 'waiting_parts',label: 'Waiting Parts',value: count('waiting_parts') },
      { key: 'done',         label: 'Done',         value: count('done') },
    ].filter(x => x.value > 0);
  });

  // por prioridad (flexible a los strings que existan en tu seed)
  openByPriority = computed(() => {
    const map = new Map<PriorityKey, number>();
    for (const t of this.openTickets()) {
      const k = String(t.priority || 'n/a');
      map.set(k, (map.get(k) || 0) + 1);
    }
    return Array.from(map, ([priority, value]) => ({ priority, value }))
      .sort((a,b)=>b.value-a.value);
  });

  // carga por técnico
  techWorkload = computed(() => {
    const techs = this.db.usersByRole('technician');
    const open = this.openTickets();
    return techs.map(u => ({
      name: u.name,
      open: open.filter(t => t.assignedToId === u.id).length
    })).sort((a,b)=>b.open-a.open);
  });

  // top propiedades con más tickets abiertos
  topProperties = computed(() => {
    const map = new Map<string, number>();
    for (const t of this.openTickets()) {
      const u = t.unitId ? this.units().find(x => x.id === t.unitId) : null;
      const pid = u?.propertyId;
      if (!pid) continue;
      map.set(pid, (map.get(pid)||0)+1);
    }
    return Array.from(map, ([pid, value]) => ({
      property: this.properties().find(p => p.id === pid)?.name || pid,
      value
    })).sort((a,b)=>b.value-a.value).slice(0, 5);
  });

  // gastos por categoría (en rango)
  expenseByCategory = computed(() => {
    const map = new Map<string, number>();
    for (const e of this.expensesInRange()) {
      map.set(e.category, (map.get(e.category)||0) + (e.amount || 0));
    }
    return Array.from(map, ([category, total]) => ({ category, total }))
      .sort((a,b)=>b.total-a.total).slice(0, 6);
  });

  // proximo Move-In/Out (inspections programadas) y últimas órdenes
  upcomingInspections = computed(() => {
    const list: any[] = (this.db as any).listInspections ? (this.db as any).listInspections() : (((this.db as any).db?.() || (this.db as any).db()).inspections || []);
    const now = new Date().getTime();
    return list
      .filter(i => i.scheduledAt && new Date(i.scheduledAt).getTime() >= now)
      .sort((a,b)=> new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0,5);
  });

  recentTickets = computed(() => {
    const list = [...this.ticketsAll()];
    list.sort((a,b)=> new Date(b.updatedAt||b.createdAt).getTime() - new Date(a.updatedAt||a.createdAt).getTime());
    return list.slice(0,5);
  });

  // helpers UI
  setRange(days: number) { this.rangeDays.set(days); }
  ringStyle(pct: number) {
    return {'background-image': `conic-gradient(#059669 ${pct}%, #e5e7eb 0)`};
  }
  barWidth(current: number, max: number) {
    const pct = !max ? 0 : Math.min(100, Math.round((current/max)*100));
    return { width: pct + '%' };
  }
  timeLeftLabel(dueAt?: string) {
    if (!dueAt) return '—';
    const diff = new Date(dueAt).getTime() - Date.now();
    if (diff <= 0) return 'Overdue';
    const h = Math.round(diff/3600000);
    return h <= 1 ? '≤1h' : `${h}h left`;
  }
  // Add this helper method to your component class
  getAgingBucketValue(key: string): number {
    return this.agingBuckets()[key as Bucket] || 0;
  }
  // Add this method to your component class
  getAgingBucketDisplayValue(bucket: string): number {
    const buckets = this.agingBuckets();
    return buckets[bucket as keyof typeof buckets] ?? 0;
  }
  // Add this method to your component class
  isOtherPriority(priority: string): boolean {
    const keywords = ['urgent', 'high', 'medium', 'low'];
    if (!priority) return true;
    const lower = priority.toLowerCase();
    return !keywords.some(k => lower.includes(k));
  }
}
