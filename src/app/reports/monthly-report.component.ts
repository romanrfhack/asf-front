import { Component } from '@angular/core';
import { NgFor, CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';
import { exportCsv } from '../core/csv.util';
import { downloadText } from '../core/download.util';

@Component({
  selector: 'monthly-report',
  standalone: true,
  imports: [NgFor, FormsModule, CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe],
  templateUrl: './monthly-report.component.html'
})
export class MonthlyReportComponent {
  // Filters
  dateStart = this.isoDate(new Date(Date.now() - 30*86400000));
  dateEnd = this.isoDate(new Date());
  campus = '';
  propertyId = '';
  unitId = '';

  constructor(private db: MockDbService) {}

  isoDate(d: Date) { return d.toISOString().slice(0,10); }

  get campuses() {
    const set = new Set(this.db.properties().map(p => p.campus || ''));
    return Array.from(set).filter(Boolean);
  }
  get properties() {
    const list = this.db.properties().filter(p => !this.campus || p.campus === this.campus);
    return list;
  }
  get units() {
    return this.db.units().filter(u => !this.propertyId || u.propertyId === this.propertyId);
  }

  // Data in range
  inRange(iso?: string) {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    const s = new Date(this.dateStart + 'T00:00:00').getTime();
    const e = new Date(this.dateEnd + 'T23:59:59').getTime();
    return t >= s && t <= e;
  }

  get expenses(): Expense[] {
    return (this.db as any).db().expenses.filter((e: any) => {
      if (!this.inRange(e.date)) return false;
      if (this.campus) {
        const prop = this.db.properties().find(p => p.id === e.propertyId);
        if (!prop || prop.campus !== this.campus) return false;
      }
      if (this.propertyId && e.propertyId !== this.propertyId) return false;
      if (this.unitId && e.unitId !== this.unitId) return false;
      return true;
    });
  }

  get ticketsOpen() {
    return this.db.listTickets().filter(t => {
      if (['done','cancelled'].includes(t.status)) return false;
      const created = new Date(t.createdAt).getTime();
      const end = new Date(this.dateEnd + 'T23:59:59').getTime();
      return created <= end;
    });
  }

  get ticketsOpenedInRange() {
    return this.db.listTickets().filter(t => this.inRange(t.createdAt));
  }

  get ticketsClosedInRange() {
    return this.db.listTickets().filter(t => t.updatedAt && this.inRange(t.updatedAt) && t.status === 'done');
  }

  get slaOnTimePct() {
    const closed = this.ticketsClosedInRange;
    if (!closed.length) return 100;
    const ontime = closed.filter(t => t.dueAt && new Date(t.updatedAt) <= new Date(t.dueAt)).length;
    return Math.round(ontime / closed.length * 100);
  }

  get avgResolutionHours() {
    const closed = this.ticketsClosedInRange.filter(t => t.updatedAt);
    if (!closed.length) return 0;
    const hours = closed.map(t => (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime())/3600000);
    const avg = hours.reduce((a,b)=>a+b,0) / hours.length;
    return Math.round(avg);
  }

  // Aggregations
  get expenseTotals() {
    return this.expenses.reduce((acc:any, e:any) => {
      acc[e.type] = (acc[e.type] || 0) + (e.amount || 0);
      return acc;
    }, { opex: 0, capex: 0 });
  }

  get byCategory() {
    const map = new Map<string, number>();
    for (const e of this.expenses) map.set(e.category, (map.get(e.category) || 0) + (e.amount || 0));
    return Array.from(map, ([category, total]) => ({ category, total })).sort((a,b)=>b.total-a.total);
  }

  get byCampus() {
    const map = new Map<string, number>();
    for (const e of this.expenses) {
      const p = this.db.properties().find(pp => pp.id === e.propertyId);
      const key = (p?.campus) || 'N/A';
      map.set(key, (map.get(key) || 0) + (e.amount || 0));
    }
    return Array.from(map, ([campus, total]) => ({ campus, total })).sort((a,b)=>b.total-a.total);
  }

  // Exports
  exportExpensesCsv() {
    const rows = this.expenses.map((e:any) => {
      const p = this.db.properties().find(pp=>pp.id===e.propertyId);
      const u = e.unitId ? this.db.units().find(uu=>uu.id===e.unitId) : null;
      return { date: e.date, campus: p?.campus || '', property: p?.name || '', unit: u?.code || '', type: e.type, category: e.category, description: e.description||'', amount: e.amount };
    });
    exportCsv('report_expenses.csv', rows);
  }

  exportTicketsCsv() {
    const rows = this.db.listTickets().filter(t => this.inRange(t.createdAt) || (t.updatedAt && this.inRange(t.updatedAt))).map(t => {
      const u = t.unitId ? this.db.units().find(uu=>uu.id===t.unitId) : null;
      const p = u ? this.db.properties().find(pp=>pp.id===u.propertyId) : null;
      const ontime = t.dueAt && t.updatedAt ? (new Date(t.updatedAt) <= new Date(t.dueAt)) : '';
      return { id: t.id, title: t.title, status: t.status, createdAt: t.createdAt, updatedAt: t.updatedAt||'', dueAt: t.dueAt||'', ontime, property: p?.name||'', unit: u?.code||'' };
    });
    exportCsv('report_tickets.csv', rows);
  }

  exportHTML() {
    const html = this.renderHTML();
    downloadText('monthly_report.html', html, 'text/html');
  }

  // Add this method to your component class
  getPropertyNameById(id: string): string {
    const property = this.properties?.find(p => p.id === id);
    return property ? property.name : '';
  }

  private renderHTML() {
    const rowsCat = this.byCategory.map(r=>`<tr><td>${r.category}</td><td style="text-align:right">${r.total.toFixed(2)}</td></tr>`).join('');
    const rowsCampus = this.byCampus.map(r=>`<tr><td>${r.campus}</td><td style="text-align:right">${r.total.toFixed(2)}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Monthly Report</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:16px;color:#0f172a} table{border-collapse:collapse;width:100%;margin:8px 0} td,th{border:1px solid #e2e8f0;padding:6px}</style>
    </head><body>
      <h1>Monthly Report</h1>
      <p><b>Range:</b> ${this.dateStart} — ${this.dateEnd}</p>
      <h2>KPIs</h2>
      <ul>
        <li>OPEX total: ${this.expenseTotals.opex.toFixed(2)}</li>
        <li>CAPEX total: ${this.expenseTotals.capex.toFixed(2)}</li>
        <li>Tickets opened: ${this.ticketsOpenedInRange.length}</li>
        <li>Tickets closed: ${this.ticketsClosedInRange.length}</li>
        <li>SLA on-time: ${this.slaOnTimePct}%</li>
        <li>Avg. resolution (h): ${this.avgResolutionHours}</li>
      </ul>
      <h2>Expenses by Category</h2>
      <table><tr><th>Category</th><th>Total</th></tr>${rowsCat}</table>
      <h2>Expenses by Campus</h2>
      <table><tr><th>Campus</th><th>Total</th></tr>${rowsCampus}</table>
    </body></html>`;
  }

}


// Add the following interface above your component decorator
interface Expense {
  propertyId: string;

  type: string;
  category: string;
  date: string;
  description?: string;
  amount: number;
  // add other fields as needed
}