import { Injectable, computed, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { ToastService } from './toast.service';
import { MockDbService } from './mock-db.service';

interface OfflineEvent {
  id: string;
  at: string;
  name: string;
  payload: any;
}

const KEY_OFFLINE = 'asfm.offline';
const KEY_QUEUE = 'asfm.queue.v1';

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private offlineSig = signal<boolean>(false);
  offline = computed(()=> this.offlineSig());
  queue = signal<OfflineEvent[]>([]);
  pendingCount = computed(()=> this.queue().length);

  constructor(private ls: LocalStorageService, private toast: ToastService, private db: MockDbService) {
    const off = this.ls.get(KEY_OFFLINE);
    this.offlineSig.set(off === '1');
    const q = this.ls.getJSON<OfflineEvent[]>(KEY_QUEUE, []);
    this.queue.set(q);
  }

  setOffline(v: boolean) {
    this.offlineSig.set(v);
    this.ls.set(KEY_OFFLINE, v ? '1' : '0');
    this.toast.show(v ? 'Offline enabled — actions will be queued' : 'Back online — you can sync pending actions', 'info');
  }

  private persistQueue() {
    this.ls.setJSON(KEY_QUEUE, this.queue());
  }

  execute(name: string, payload: any, fn: () => void) {
    if (this.offline()) {
      const ev: OfflineEvent = { id: Math.random().toString(36).slice(2,10), at: new Date().toISOString(), name, payload };
      this.queue.update(a => [ev, ...a]);
      this.persistQueue();
      this.toast.show('Queued: ' + name, 'info');
      return;
    }
    fn();
    this.toast.show('Saved');
  }

  flush() {
    const items = [...this.queue()];
    for (const ev of items) {
      try {
        this.apply(ev);
        this.queue.update(a => a.filter(x => x.id !== ev.id));
      } catch (e) {
        this.toast.show('Failed: ' + ev.name, 'error');
        break;
      }
    }
    this.persistQueue();
    this.toast.show('Sync complete');
  }

  clear() {
    this.queue.set([]);
    this.persistQueue();
  }

  private apply(ev: OfflineEvent) {
    const p = ev.payload || {};
    switch(ev.name) {
      case 'addCheckIn': return this.db.addCheckIn(p.ticketId, p.mode, p.lat, p.lng);
      case 'addChecklistItem': return this.db.addChecklistItem(p.ticketId, p.text);
      case 'toggleChecklistItem': return this.db.toggleChecklistItem(p.ticketId, p.itemId);
      case 'addPhoto': return this.db.addPhoto(p.ticketId, p.dataUrl);
      case 'addPart': return this.db.addPart(p.ticketId, p.name, p.qty, p.unitCost);
      case 'removePart': return this.db.removePart(p.ticketId, p.partId);
      case 'setSignature': return this.db.setSignature(p.ticketId, p.dataUrl);
      case 'setTechNotes': return this.db.setTechNotes(p.ticketId, p.notes);
      case 'completeTicket': return this.db.completeTicket(p.ticketId);
      case 'setTechTranslated': return this.db.setTechTranslated(p.ticketId, p.flag);
      default: throw new Error('Unknown event: ' + ev.name);
    }
  }
}
