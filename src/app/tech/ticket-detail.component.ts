import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgFor, DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { SignaturePadComponent } from './signature-pad.component';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';
import { OfflineService } from '../core/offline.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'tech-ticket-detail',
  standalone: true,
  imports: [NgFor, CommonModule, DatePipe, FormsModule, SignaturePadComponent, DecimalPipe ],
  templateUrl: './ticket-detail.component.html'
})
export class TechTicketDetailComponent {
  id = '';
  ticket: any = null;

  // checklist
  newTask = '';
  // parts
  partName = ''; partQty: any = 1; partCost: any = 0;

  notes = '';

  translated = false;
  constructor(private route: ActivatedRoute, private db: MockDbService, private offline: OfflineService, private toast: ToastService) {
    effect(() => {
      this.id = this.route.snapshot.paramMap.get('id') || '';
      this.ticket = this.db.getTicket(this.id);
      this.translated = !!this.ticket?.tech?.translated;
      this.notes = this.ticket?.tech?.notes || '';
    });
  }

  refresh() { this.ticket = this.db.getTicket(this.id); }

  async checkInGPS() {
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      this.offline.execute('addCheckIn', { ticketId: this.id, mode: 'gps', lat: pos.coords.latitude, lng: pos.coords.longitude }, () => this.db.addCheckIn(this.id, 'gps', pos.coords.latitude, pos.coords.longitude));
    } catch {
      // fallback random near 25.67,-100.31 (Monterrey-ish)
      const lat = 25.67 + (Math.random()-0.5)/100;
      const lng = -100.31 + (Math.random()-0.5)/100;
      this.offline.execute('addCheckIn', { ticketId: this.id, mode: 'gps', lat, lng }, () => this.db.addCheckIn(this.id, 'gps', lat, lng));
    }
    this.refresh();
  }
  checkInQR() {
    this.offline.execute('addCheckIn', { ticketId: this.id, mode: 'qr' }, () => this.db.addCheckIn(this.id, 'qr'));
    this.refresh();
  }

  addTask() {
    if (!this.newTask.trim()) return;
    this.offline.execute('addChecklistItem', { ticketId: this.id, text: this.newTask }, () => this.db.addChecklistItem(this.id, this.newTask));
    this.newTask = '';
    this.refresh();
  }
  toggleTask(cid: string) {
    this.offline.execute('toggleChecklistItem', { ticketId: this.id, itemId: cid }, () => this.db.toggleChecklistItem(this.id, cid));
    this.refresh();
  }

  async onPhotosSelected(ev: Event) {
    const files = Array.from((ev.target as HTMLInputElement).files || []);
    for (const f of files) {
      const dataUrl = await fToDataURL(f);
      this.offline.execute('addPhoto', { ticketId: this.id, dataUrl }, () => this.db.addPhoto(this.id, dataUrl));
    }
    this.refresh();
  }

  addPart() {
    const q = Number(this.partQty) || 0;
    const c = Number(this.partCost) || 0;
    if (!this.partName.trim() || q <= 0) return;
    this.offline.execute('addPart', { ticketId: this.id, name: this.partName, qty: q, unitCost: c }, () => this.db.addPart(this.id, this.partName, q, c));
    this.partName = ''; this.partQty = 1; this.partCost = 0;
    this.refresh();
  }
  removePart(pid: string) { this.offline.execute('removePart', { ticketId: this.id, partId: pid }, () => this.db.removePart(this.id, pid)); this.refresh(); }

  saveNotes() { this.offline.execute('setTechNotes', { ticketId: this.id, notes: this.notes }, () => this.db.setTechNotes(this.id, this.notes)); this.refresh(); }
  setSignature(dataUrl: string) { this.offline.execute('setSignature', { ticketId: this.id, dataUrl }, () => this.db.setSignature(this.id, dataUrl)); this.refresh(); }

  complete() { this.offline.execute('completeTicket', { ticketId: this.id }, () => this.db.completeTicket(this.id)); this.refresh(); }
  
  setTranslated(flag: boolean) {
    this.translated = flag;
    this.offline.execute('setTechTranslated', { ticketId: this.id, flag }, () => this.db.setTechTranslated(this.id, flag));
    this.toast.show(flag ? 'Marked as translated' : 'Translation tag removed', 'info');
    this.refresh();
  }
}

function fToDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
