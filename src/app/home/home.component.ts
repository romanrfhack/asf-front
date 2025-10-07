import { Component, computed } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

type Role = 'admin' | 'technician' | 'owner' | 'tenant';
type Accent = 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'violet' | 'slate';
type IconName =
  | 'building' | 'wrench' | 'kanban' | 'clipboard' | 'chart'
  | 'doc' | 'calendar' | 'briefcase' | 'sync' | 'gear' | 'help';

type LinkItem = {
  route: string;
  title: string;
  desc: string;
  accent: Accent;
  icon: IconName;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, NgSwitch, NgSwitchCase],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(public auth: AuthService) {}

  // Links by role: English for all, Spanish only for "technician"
  private LINKS: Record<Role, LinkItem[]> = {
    admin: [
      { route: '/admin/dashboard',  title: 'Dashboard',      desc: 'KPIs, aging & SLA.',                 accent: 'indigo',  icon: 'chart' },
      { route: '/admin/tickets',    title: 'Tickets Board',  desc: 'Workflow and statuses.',             accent: 'violet',  icon: 'kanban' },
      { route: '/admin/properties', title: 'Properties',     desc: 'Property catalog.',                  accent: 'emerald', icon: 'building' },
      { route: '/admin/units',      title: 'Units',          desc: 'Units by property.',                 accent: 'sky',     icon: 'doc' },
      { route: '/admin/assignments',title: 'Assignments',    desc: 'Assign to technicians / waitlist.',  accent: 'amber',   icon: 'briefcase' },
      { route: '/inspections',      title: 'Inspections',    desc: 'Move-In/Out wizard & signatures.',   accent: 'rose',    icon: 'clipboard' },
      { route: '/reports/monthly',  title: 'Monthly Report', desc: 'OPEX/CAPEX, SLA & export.',          accent: 'indigo',  icon: 'chart' },
    ],
    owner: [
      { route: '/owner/portfolio',  title: 'Portfolio',      desc: 'KPIs by property & totals.',         accent: 'indigo',  icon: 'chart' },
      { route: '/reports/monthly',  title: 'Monthly Report', desc: 'Financial & operations summary.',    accent: 'violet',  icon: 'chart' },
    ],
    tenant: [
      { route: '/tenant/documents', title: 'Documents',      desc: 'Contracts & files.',                 accent: 'sky',     icon: 'doc' },
      { route: '/tenant/appointments', title: 'Appointments',desc: 'Bookings & follow-up.',              accent: 'amber',   icon: 'calendar' },
    ],
    technician: [
      { route: '/tech/orders',      title: 'Mis Órdenes',    desc: 'Check-in, checklist, fotos y cierre.', accent: 'emerald', icon: 'wrench' },
      { route: '/inspections',      title: 'Inspecciones',   desc: 'Move-In/Out asignadas.',               accent: 'rose',    icon: 'clipboard' },
    ],
  };

  // Utilities (always visible; English)
  utilities: LinkItem[] = [
    { route: '/sync',  title: 'Sync',         desc: 'Offline queue & synchronization.', accent: 'slate', icon: 'sync' },
    // { route: '/settings', title: 'Settings', desc: 'Demo preferences.',               accent: 'slate', icon: 'gear' },
    // { route: '/help',     title: 'Help',     desc: 'Quick start guide.',              accent: 'slate', icon: 'help' },
  ];

  currentRole = computed<Role>(() => (this.auth.role() as Role) ?? 'admin');
  visibleLinks = computed<LinkItem[]>(() => this.LINKS[this.currentRole()]);

  // styling helpers
  accentClasses(a: Accent) {
    const map = {
      emerald: { band: 'bg-emerald-500', icon: 'text-emerald-600 bg-emerald-50' },
      amber:   { band: 'bg-amber-500',   icon: 'text-amber-600 bg-amber-50' },
      rose:    { band: 'bg-rose-500',    icon: 'text-rose-600 bg-rose-50' },
      indigo:  { band: 'bg-indigo-600',  icon: 'text-indigo-600 bg-indigo-50' },
      sky:     { band: 'bg-sky-500',     icon: 'text-sky-600 bg-sky-50' },
      violet:  { band: 'bg-violet-500',  icon: 'text-violet-600 bg-violet-50' },
      slate:   { band: 'bg-slate-500',   icon: 'text-slate-700 bg-slate-100' },
    } as const;
    return map[a] || map.indigo;
  }
}
