import { Component } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDbService } from '../core/mock-db.service';

@Component({
  selector: 'inspections-list',
  standalone: true,
  imports: [NgFor, DatePipe, RouterModule],
  templateUrl: './inspections-list.component.html'
})
export class InspectionsListComponent {
  filter: 'all'|'draft'|'finalized' = 'all';
  constructor(private db: MockDbService) {}
  get items() {
    const list = this.db.listInspections();
    return this.filter === 'all' ? list : list.filter(i => i.status === this.filter);
  }
  create(type: 'move-in'|'move-out') {
    const ins = this.db.addInspection({ type });
    return ['/inspections', ins.id];
  }
}
