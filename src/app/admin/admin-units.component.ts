import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';
import { exportCsv } from '../core/csv.util';

@Component({
  selector: 'admin-units',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './admin-units.component.html'
})
export class AdminUnitsComponent {
  propertyId = '';
  code = '';
  floor = '';
  bedrooms: number | null = null;

  constructor(private db: MockDbService) {}

  get props() { return this.db.properties(); }
  get items() { return this.db.units().filter(u => !this.propertyId || u.propertyId === this.propertyId); }

  add() {
    if (!this.code.trim()) return;
    const id = 'un_' + Math.random().toString(36).slice(2,10);
    const u = { id, propertyId: this.propertyId || this.props[0]?.id, code: this.code, floor: this.floor, bedrooms: this.bedrooms || 0 };
    (this.db as any).db.mutate((s: any) => s.units.unshift(u));
    (this.db as any).ls.setJSON('asfm.db.v1', (this.db as any).db());
    this.code = this.floor = '';
    this.bedrooms = null;
  }
  export() {
    exportCsv('units.csv', this.items);
  }

  getPropertyName(propertyId: any): string {
    const prop = this.props?.find(p => p.id === propertyId);
    return prop?.name || '-';
  }
}
