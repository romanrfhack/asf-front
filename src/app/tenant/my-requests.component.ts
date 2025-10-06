import { Component, computed } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';
import { MockDbService } from '../core/mock-db.service';


@Component({
  selector: 'tenant-my-requests',
  standalone: true,
  imports: [NgFor, DatePipe],
  templateUrl: './my-requests.component.html'
})
export class MyRequestsComponent {
  tickets = computed(() => this.db.listTickets());
  constructor(private db: MockDbService) {}
}
