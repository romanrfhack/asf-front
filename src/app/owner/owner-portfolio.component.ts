import { Component } from '@angular/core';
import { NgFor, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDbService } from '../core/mock-db.service';
import { exportCsv } from '../core/csv.util';

@Component({
  selector: 'owner-portfolio',
  standalone: true,
  imports: [NgFor, RouterModule, CurrencyPipe],
  templateUrl: './owner-portfolio.component.html'
})
export class OwnerPortfolioComponent {
  constructor(private db: MockDbService) {}
  get properties() { return this.db.properties(); }

  kpis(p: any) {
    const o = this.db.totalByType(p.id);
    const open = this.db.openTicketsByProperty(p.id);
    const units = this.db.unitsByProperty(p.id);
    return { opex: o.opex || 0, capex: o.capex || 0, open, units };
  }

  exportExpenses() {
    const rows: any[] = [];
    for (const p of this.properties) {
      const exps = (this.db as any).db().expenses.filter((e:any)=> e.propertyId===p.id);
      for (const e of exps) rows.push({ property: p.name, date: e.date, type: e.type, category: e.category, description: e.description, amount: e.amount });
    }
    exportCsv('owner_expenses.csv', rows);
  }
}
