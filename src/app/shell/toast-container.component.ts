import { Component, computed } from '@angular/core';
import { NgFor } from '@angular/common';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'toast-container',
  standalone: true,
  imports: [NgFor],
  template: `
  <div class="fixed bottom-20 right-4 space-y-2 z-50">
    <div *ngFor="let t of toasts()" class="px-3 py-2 rounded-lg shadow text-white"
         [class.bg-emerald-600]="t.type==='success'"
         [class.bg-slate-800]="t.type==='info'"
         [class.bg-rose-600]="t.type==='error'">
      {{ t.text }}
    </div>
  </div>
  `
})
export class ToastContainerComponent {
  toasts = computed(() => this.toast.toasts());
  constructor(private toast: ToastService) {}
}
