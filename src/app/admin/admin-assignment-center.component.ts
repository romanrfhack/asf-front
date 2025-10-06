import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';

@Component({
  selector: 'admin-assignment-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-assignment-center.component.html'
})
export class AdminAssignmentCenterComponent {
  selectedTech = '';
  note = '';
  requestedFor = '';
  priority = 3;

  constructor(private db: MockDbService) {}

  get unassigned() { return this.db.listTickets().filter(t => !t.assignedToId && t.status !== 'done' && t.status !== 'cancelled'); }
  get techs() { return this.db.usersByRole('technician'); }
  get waitlist() { return this.db.listWaitlist(); }

  assign(ticketId: string) {
    const techId = this.selectedTech || this.techs[0]?.id;
    if (!techId) return;
    this.db.assignTicket(ticketId, techId);
    this.selectedTech = '';
  }
  addToWaitlist(ticketId: string) {
    const iso = this.requestedFor ? new Date(this.requestedFor).toISOString() : undefined;
    this.db.addToWaitlist(ticketId, this.note, iso, this.priority);
    this.note = '';
    this.requestedFor = '';
    this.priority = 3;
  }
  removeWait(id: string) { this.db.removeWaitlist(id); }
}
