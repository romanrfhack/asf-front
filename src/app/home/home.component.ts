import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NgFor } from '@angular/common';


type LinkItem = { route: string; title: string; desc: string; badge: string };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NgFor],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  role = computed(() => this.auth.role());
  constructor(public auth: AuthService) {}

  tenantLinks: LinkItem[] = [
    { route: '/tenant/documents',   title: 'Documents',     desc: 'Policies, contracts y archivos del inquilino.', badge: 'Tenant' },
    { route: '/tenant/appointments',title: 'Appointments',  desc: 'Agenda de citas y estado de solicitudes.',      badge: 'Tenant' },
  ];

  ownerLinks: LinkItem[] = [
    { route: '/owner/documents',    title: 'Documents',     desc: 'Documentos del propietario.',                   badge: 'Owner' },
    { route: '/owner/portfolio',    title: 'Portfolio',     desc: 'KPIs por propiedad y totales OPEX/CAPEX.',      badge: 'Owner' },
  ];

  technicianLinks: LinkItem[] = [
    { route: '/tech/orders',        title: 'My Orders',     desc: 'Check-in, checklist, fotos, parts y cierre.',   badge: 'Technician' },
  ];

  inspectionsLinks: LinkItem[] = [
    { route: '/inspections',        title: 'Inspections',   desc: 'Move-In/Out wizard, fotos y firmas.',           badge: 'Admin / Technician' },
  ];

  reportsLinks: LinkItem[] = [
    { route: '/reports',            title: 'Reports',       desc: 'Centro de reportes.',                            badge: 'Owner / Admin' },
    { route: '/reports/monthly',    title: 'Monthly Report',desc: 'KPIs, categorías y export (CSV/HTML).',         badge: 'Owner / Admin' },
  ];

  adminLinks: LinkItem[] = [
    { route: '/admin/tickets',      title: 'Tickets Board', desc: 'Kanban de tickets por estado/prioridad.',        badge: 'Admin' },
    { route: '/admin/dashboard',    title: 'Dashboard',     desc: 'Open/Overdue, Done, SLA y Aging.',               badge: 'Admin' },
    { route: '/admin/properties',   title: 'Properties',    desc: 'Catálogo y exportación CSV.',                    badge: 'Admin' },
    { route: '/admin/units',        title: 'Units',         desc: 'Unidades por propiedad + export CSV.',           badge: 'Admin' },
    { route: '/admin/assignments',  title: 'Assignment Center', desc: 'Asignar tickets o enviar a Waitlist.',      badge: 'Admin' },
  ];

  utilityLinks: LinkItem[] = [
    { route: '/sync',               title: 'Sync',          desc: 'Cola offline y sincronización de acciones.',     badge: 'All roles' },
  ];
}
