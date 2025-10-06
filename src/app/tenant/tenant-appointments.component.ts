import { Component } from '@angular/core';
import { NgFor, DatePipe, UpperCasePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';


@Component({
  selector: 'tenant-appointments',
  standalone: true,
  imports: [NgFor, CommonModule, DatePipe, UpperCasePipe, FormsModule],
  templateUrl: './tenant-appointments.component.html'
})
export class TenantAppointmentsComponent {
  title = '';
  when = '';
  notes = '';

  constructor(private db: MockDbService) {}

  get items() {
    const tenantId = this.db.usersByRole('tenant')[0]?.id;
    return this.db.listAppointmentsForUser(tenantId);
  }

  add() {
    if (!this.title.trim() || !this.when) return;
    const iso = new Date(this.when).toISOString();
    const tenantId = this.db.usersByRole('tenant')[0]?.id;
    this.db.addAppointment({ title: this.title, when: iso, requesterId: tenantId, notes: this.notes });
    this.title = '';
    this.when = '';
    this.notes = '';
  }

  setStatus(id: string, status: 'requested'|'confirmed'|'done'|'cancelled') {
    this.db.setAppointmentStatus(id, status);
  }
}
