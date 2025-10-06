import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';
import { exportCsv } from '../core/csv.util';

@Component({
  selector: 'admin-properties',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './admin-properties.component.html'
})
export class AdminPropertiesComponent {
  editingId: string | null = null;
  code = ''; name = ''; campus = '';

  constructor(private db: MockDbService) {}

  get items() { return this.db.properties(); }
  save() {
    if (!this.name.trim()) return;
    const id = (Math.random().toString(36).slice(2,10));
    const p = { id: 'p_' + id, code: this.code || ('P-' + id.toUpperCase()), name: this.name, campus: this.campus };
    (this.db as any).db.mutate((s: any) => s.properties.unshift(p));
    (this.db as any).ls.setJSON('asfm.db.v1', (this.db as any).db());
    this.code = this.name = this.campus = '';
  }
  del(id: string) {
    (this.db as any).db.mutate((s: any) => s.properties = s.properties.filter((x: any) => x.id !== id));
    (this.db as any).ls.setJSON('asfm.db.v1', (this.db as any).db());
  }
  export() {
    exportCsv('properties.csv', this.items);
  }
}
