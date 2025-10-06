import { Routes } from '@angular/router';
import { roleGuard } from './core/role.guard';
import { AppShellComponent } from './shell/app-shell.component';
import { HomeComponent } from './home/home.component';
import { ReportIssueComponent } from './tenant/report-issue.component';
import { MyRequestsComponent } from './tenant/my-requests.component';
import { TicketsBoardComponent } from './admin/tickets-board.component';
import { TenantDocsComponent } from './tenant/tenant-docs.component';
import { OwnerDocsComponent } from './owner/owner-docs.component';
import { TenantAppointmentsComponent } from './tenant/tenant-appointments.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminPropertiesComponent } from './admin/admin-properties.component';
import { AdminUnitsComponent } from './admin/admin-units.component';
import { AdminAssignmentCenterComponent } from './admin/admin-assignment-center.component';
import { TechOrdersComponent } from './tech/orders.component';
import { TechTicketDetailComponent } from './tech/ticket-detail.component';
import { InspectionsListComponent } from './inspections/inspections-list.component';
import { InspectionWizardComponent } from './inspections/inspection-wizard.component';
import { OwnerPortfolioComponent } from './owner/owner-portfolio.component';
import { OwnerPropertyDetailComponent } from './owner/owner-property-detail.component';
import { SyncCenterComponent } from './sync/sync-center.component';
import { ToastContainerComponent } from './shell/toast-container.component';
import { MonthlyReportComponent } from './reports/monthly-report.component';
import { ReportsHomeComponent } from './reports/reports-home.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'tenant/report', component: ReportIssueComponent, canMatch: [roleGuard], data: { roles: ['tenant', 'admin'] } },
      { path: 'tenant/requests', component: MyRequestsComponent, canMatch: [roleGuard], data: { roles: ['tenant', 'admin'] } },
      { path: 'admin/tickets', component: TicketsBoardComponent, canMatch: [roleGuard], data: { roles: ['admin'] } },
      { path: 'tenant/documents', component: TenantDocsComponent, canMatch: [roleGuard], data: { roles: ['tenant', 'admin'] } },
      { path: 'owner/documents', component: OwnerDocsComponent, canMatch: [roleGuard], data: { roles: ['owner', 'admin'] } },
      { path: 'tenant/appointments', component: TenantAppointmentsComponent, canMatch: [roleGuard], data: { roles: ['tenant', 'admin'] } },
      { path: 'admin/dashboard', component: AdminDashboardComponent, canMatch: [roleGuard], data: { roles: ['admin'] } },
      { path: 'admin/properties', component: AdminPropertiesComponent, canMatch: [roleGuard], data: { roles: ['admin'] } },
      { path: 'admin/units', component: AdminUnitsComponent, canMatch: [roleGuard], data: { roles: ['admin'] } },
      { path: 'admin/assignments', component: AdminAssignmentCenterComponent, canMatch: [roleGuard], data: { roles: ['admin'] } },

      { path: 'tech/orders', component: TechOrdersComponent, canMatch: [roleGuard], data: { roles: ['technician', 'admin'] } },
      { path: 'tech/ticket/:id', component: TechTicketDetailComponent, canMatch: [roleGuard], data: { roles: ['technician', 'admin'] } },
      { path: 'inspections', component: InspectionsListComponent, canMatch: [roleGuard], data: { roles: ['admin', 'technician'] } },
      { path: 'inspections/:id', component: InspectionWizardComponent, canMatch: [roleGuard], data: { roles: ['admin', 'technician'] } },
      { path: 'owner/portfolio', component: OwnerPortfolioComponent, canMatch: [roleGuard], data: { roles: ['owner', 'admin'] } },
      { path: 'owner/property/:id', component: OwnerPropertyDetailComponent, canMatch: [roleGuard], data: { roles: ['owner', 'admin'] } },
      { path: 'sync', component: SyncCenterComponent, canMatch: [roleGuard], data: { roles: ['tenant','owner','admin','technician'] } },
      { path: 'reports', component: ReportsHomeComponent, canMatch: [roleGuard], data: { roles: ['owner','admin'] } },
      { path: 'reports/monthly', component: MonthlyReportComponent, canMatch: [roleGuard], data: { roles: ['owner','admin'] } },


    ],
  },
  { path: '**', redirectTo: '' }
];
