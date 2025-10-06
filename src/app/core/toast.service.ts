import { Injectable, signal } from '@angular/core';

export type ToastType = 'success'|'info'|'error';
export interface Toast { id: string; text: string; type: ToastType; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(text: string, type: ToastType = 'success', timeoutMs = 2200) {
    const id = Math.random().toString(36).slice(2,10);
    const item: Toast = { id, text, type };
    this.toasts.update(arr => [item, ...arr]);
    setTimeout(() => this.dismiss(id), timeoutMs);
  }

  dismiss(id: string) {
    this.toasts.update(arr => arr.filter(t => t.id !== id));
  }
}
