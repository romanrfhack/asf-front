import { Component } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDbService } from '../core/mock-db.service';


@Component({
  selector: 'tech-orders',
  standalone: true,
  imports: [NgFor, DatePipe, RouterModule],
  templateUrl: './orders.component.html'
})
export class TechOrdersComponent {
  constructor(private db: MockDbService) {}
  get techId() { return this.db.usersByRole('technician')[0]?.id; }
  get items() { return this.db.listTickets().filter((t: any) => t.assignedToId === this.techId); }
}
