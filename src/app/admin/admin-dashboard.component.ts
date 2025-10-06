import { Component, computed } from '@angular/core';
import { NgFor, CommonModule } from '@angular/common';
import { MockDbService } from '../core/mock-db.service';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  now = new Date();

  tickets = computed(() => this.db.listTickets());
  open = computed(() => this.tickets().filter(t => !['done','cancelled'].includes(t.status)));
  done = computed(() => this.tickets().filter(t => t.status === 'done'));
  overdue = computed(() => this.open().filter(t => t.dueAt && new Date(t.dueAt) < this.now));
  onTimePct = computed(() => {
    const o = this.open().length;
    if (!o) return 100;
    const ontime = this.open().length - this.overdue().length;
    return Math.round( (ontime / o) * 100 );
  });

  // Aging buckets (days)
  agingBuckets = computed(() => {
    const buckets = { '0-1d': 0, '1-3d': 0, '3-7d': 0, '7d+': 0 } as Record<string, number>;
    for (const t of this.open()) {
      const ageDays = Math.floor((this.now.getTime() - new Date(t.createdAt).getTime()) / 86400000);
      if (ageDays <= 1) buckets['0-1d']++;
      else if (ageDays <= 3) buckets['1-3d']++;
      else if (ageDays <= 7) buckets['3-7d']++;
      else buckets['7d+']++;
    }
    return buckets;
  });

  constructor(private db: MockDbService) {}
}
