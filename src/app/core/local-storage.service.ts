import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  set(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch {}
  }
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch {}
  }
  getJSON<T>(key: string, fallback: T): T {
    const raw = this.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  setJSON(key: string, value: unknown): void {
    this.set(key, JSON.stringify(value));
  }
}
