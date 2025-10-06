import { Component, computed } from '@angular/core';
import { NgFor, DatePipe, CommonModule } from '@angular/common';
import { MockDbService } from '../core/mock-db.service';


@Component({
  selector: 'owner-documents',
  standalone: true,
  imports: [NgFor, CommonModule, DatePipe],
  templateUrl: './owner-docs.component.html'
})
export class OwnerDocsComponent {
  docs = computed(() => this.db.listDocsForRole('owner'));
  selectedId: string | null = null;
  constructor(private db: MockDbService) {}
  view(id: string) { this.selectedId = this.selectedId === id ? null : id; }
  getDoc(id: string) { return this.db.getDoc(id); }
}
