import { Component, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { OfflineService } from '../core/offline.service';
import { Role } from '../core/models';
import { ToastContainerComponent } from './toast-container.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, CommonModule, ToastContainerComponent],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {
  roles = ['tenant', 'owner', 'admin', 'technician'] as const;
  current = computed(() => this.auth.role());
  
  constructor(public auth: AuthService, private router: Router, public offline: OfflineService) {}
  
  onRoleChange(event: Event) {
    const target = event.target as HTMLSelectElement;    
    this.auth.loginAs(target.value as Role);
    this.router.navigateByUrl('/', { replaceUrl: true })
      .then(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}
