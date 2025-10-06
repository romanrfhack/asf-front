import { Component, computed } from '@angular/core';
import { NgFor, DatePipe, CommonModule } from '@angular/common';
import { MockDbService } from '../core/mock-db.service';


@Component({
  selector: 'tenant-documents',
  standalone: true,
  imports: [NgFor, CommonModule, DatePipe],
  templateUrl: './tenant-docs.component.html'
})
export class TenantDocsComponent {
  docs = computed(() => this.db.listDocsForRole('tenant'));
  selectedId: string | null = null;
  constructor(private db: MockDbService) {}
  view(id: string) { this.selectedId = this.selectedId === id ? null : id; }
  getDoc(id: string) { return this.db.getDoc(id); }
}
