import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, CurrencyPipe, DatePipe, UpperCasePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';
import { exportCsv } from '../core/csv.util';

@Component({
  selector: 'owner-property-detail',
  standalone: true,
  imports: [NgFor, CommonModule, CurrencyPipe, DatePipe, FormsModule, UpperCasePipe],
  templateUrl: './owner-property-detail.component.html'
})
export class OwnerPropertyDetailComponent {
  id = '';
  prop: any = null;
  filter: 'all'|'opex'|'capex' = 'all';

  // new expense
  date = ''; type: 'opex'|'capex' = 'opex'; category = ''; amount: any = ''; description = '';

  constructor(private route: ActivatedRoute, private db: MockDbService) {
    effect(()=>{
      this.id = this.route.snapshot.paramMap.get('id') || '';
      this.prop = this.db.properties().find(p => p.id === this.id);
    });
  }

  kpi() { return this.db.totalByType(this.id); }
  openTickets() { return this.db.openTicketsByProperty(this.id); }
  unitsCount() { return this.db.unitsByProperty(this.id); }
  get expenses() {
    const all = this.db.listExpensesByProperty(this.id);
    return this.filter === 'all' ? all : all.filter(e => e.type === this.filter);
  }

  addExpense() {
    if (!this.date || !this.category.trim() || !this.amount) return;
    const amt = Number(this.amount) || 0;
    this.db.addExpense({ propertyId: this.id, date: new Date(this.date).toISOString(), type: this.type, category: this.category, amount: amt, description: this.description });
    this.date = this.category = this.description = ''; this.amount=''; this.type='opex';
  }

  async onEvidenceSelect(e: any, expenseId: string) {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const du = await fileToDataURL(f as File);
      this.db.addExpenseEvidence(expenseId, du);
    }
  }

  exportCsv() {
    const rows = this.expenses.map(e => ({ property: this.prop.name, date: e.date, type: e.type, category: e.category, description: e.description, amount: e.amount }));
    exportCsv(`${this.prop.code}_expenses.csv`, rows);
  }

  removeExpense(id: string) { this.db.removeExpense(id); }

  // helpers
  listUnits() { return this.db.units().filter(u => u.propertyId === this.id); }
}

function fileToDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
