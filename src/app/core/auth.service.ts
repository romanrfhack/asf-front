import { Injectable, signal, computed } from '@angular/core';
import { Role } from './models';
import { LocalStorageService } from './local-storage.service';

const KEY = 'asfm.role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private roleSig = signal<Role | null>(null);

  role = computed(() => this.roleSig());
  isLoggedIn = computed(() => !!this.roleSig());
  isAdmin = computed(() => this.roleSig() === 'admin');
  isTenant = computed(() => this.roleSig() === 'tenant');
  isOwner = computed(() => this.roleSig() === 'owner');
  isTechnician = computed(() => this.roleSig() === 'technician');

  constructor(private ls: LocalStorageService) {
    const saved = this.ls.get(KEY) as Role | null;
    const initial: Role = saved ?? 'admin';        
    this.roleSig.set(initial);
    this.ls.set(KEY, initial);
  }

  loginAs(role: Role) {
    this.roleSig.set(role);
    this.ls.set(KEY, role);
  }

  logout() {
    this.roleSig.set(null);
    this.ls.remove(KEY);
  }
}
