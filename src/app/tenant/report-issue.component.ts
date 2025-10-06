import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDbService } from '../core/mock-db.service';
import { TicketPriority } from '../core/models';

@Component({
  selector: 'tenant-report-issue',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-issue.component.html'
})
export class ReportIssueComponent {
  title = '';
  description = '';
  priority: TicketPriority = 'medium';

  constructor(private db: MockDbService, private router: Router) {}

  submit() {
    if (!this.title.trim()) return;
    this.db.upsertTicket({ title: this.title, description: this.description, priority: this.priority });
    this.title = '';
    this.description = '';
    this.priority = 'medium';
    this.router.navigateByUrl('/tenant/requests');
  }
}
