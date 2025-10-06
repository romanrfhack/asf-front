import { Component, computed } from '@angular/core';
import { DatePipe, NgFor } from '@angular/common';


import { MockDbService } from '../core/mock-db.service';
import { TicketStatus } from '../core/models';

@Component({
  selector: 'admin-tickets-board',
  standalone: true,
  imports: [NgFor, DatePipe],
  templateUrl: './tickets-board.component.html'
})
export class TicketsBoardComponent {
  cols: { key: TicketStatus, label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'triage', label: 'Triage' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'waiting', label: 'Waiting' },
    { key: 'done', label: 'Done' },
  ];

  constructor(private db: MockDbService) {}

  list(k: TicketStatus) { return this.db.byStatus(k); }
  move(id: string, k: TicketStatus) { this.db.moveTicket(id, k); }
}
