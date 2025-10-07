import { Component, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { OfflineService } from '../core/offline.service';
import { Role } from '../core/models';
import { ToastContainerComponent } from './toast-container.component';

type NavItem = {
  route: string;
  label: string;
  icon?: 'home'|'requests'|'orders'|'tickets'|'dashboard'|'inspections'|'portfolio'|'reports'|'sync';
  badgeCount?: () => number; // para Sync u otros contadores
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, CommonModule, ToastContainerComponent],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {
  roles = ['tenant', 'owner', 'admin', 'technician'] as const;
  current = computed(() => this.auth.role());
  
  constructor(
      public auth: AuthService, 
      private router: Router, 
      public offline: OfflineService)
    {}
  
  onRoleChange(event: Event) {
    const role = (event.target as HTMLSelectElement).value as Role;
    this.auth.loginAs(role);
    this.router.navigateByUrl('/', { replaceUrl: true })
      .then(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Menú móvil dinámico: 4 slots (Home, slot2, slot3, Sync)
  bottomNav = computed<NavItem[]>(() => {
    const role = this.auth.role() as Role | null;

    // Labels en español SOLO para technician
    const isTech = role === 'technician';

    const home: NavItem = { route: '/', label: isTech ? 'Inicio' : 'Home', icon: 'home' };

    // Slot 2 y 3 por rol
    let slot2: NavItem;
    let slot3: NavItem;

    switch (role) {
      case 'tenant':
        slot2 = { route: '/tenant/requests', label: 'My Requests', icon: 'requests' };
        slot3 = { route: '/tenant/appointments', label: 'Appointments', icon: 'dashboard' };
        break;
      case 'technician':
        slot2 = { route: '/tech/orders', label: 'Mis Órdenes', icon: 'orders' };
        slot3 = { route: '/inspections', label: 'Inspecciones', icon: 'inspections' };
        break;
      case 'owner':
        slot2 = { route: '/owner/portfolio', label: 'Portfolio', icon: 'portfolio' };
        slot3 = { route: '/reports/monthly', label: 'Reports', icon: 'reports' };
        break;
      case 'admin':
      default:
        slot2 = { route: '/admin/tickets', label: 'Tickets', icon: 'tickets' };
        slot3 = { route: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' };
        break;
    }

    const sync: NavItem = {
      route: '/sync',
      label: 'Sync',
      icon: 'sync',
      badgeCount: () => this.offline.pendingCount()
    };

    return [home, slot2, slot3, sync];
  });
}
