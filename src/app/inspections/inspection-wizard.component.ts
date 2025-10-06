import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDbService } from '../core/mock-db.service';
import { downloadText } from '../core/download.util';
import { SignaturePadComponent } from '../tech/signature-pad.component';

@Component({
  selector: 'inspection-wizard',
  standalone: true,
  imports: [NgFor, CommonModule, DatePipe, FormsModule, SignaturePadComponent],
  templateUrl: './inspection-wizard.component.html'
})
export class InspectionWizardComponent {
  id = '';
  ins: any = null;

  // details
  occupantName = '';
  scheduledAt = '';

  // room add
  roomName = '';
  itemText = '';

  // notes
  notes = '';

  constructor(private route: ActivatedRoute, private db: MockDbService) {
    effect(() => {
      this.id = this.route.snapshot.paramMap.get('id') || '';
      this.ins = this.db.getInspection(this.id);
      if (this.ins) {
        this.occupantName = this.ins.occupantName || '';
        this.scheduledAt = this.ins.scheduledAt ? new Date(this.ins.scheduledAt).toISOString().slice(0,16) : '';
        this.notes = this.ins.notes || '';
      }
    });
  }

  saveDetails() {
    const sched = this.scheduledAt ? new Date(this.scheduledAt).toISOString() : undefined;
    this.db.updateInspection(this.id, { occupantName: this.occupantName, scheduledAt: sched });
    this.refresh();
  }

  refresh(){ this.ins = this.db.getInspection(this.id); }

  addRoom() {
    if (!this.roomName.trim()) return;
    const room = { id: cryptoRandomId('r_'), name: this.roomName, items: [] as any[] };
    const rooms = [...(this.ins.rooms || []), room];
    this.db.updateInspection(this.id, { rooms });
    this.roomName = '';
    this.refresh();
  }

  addItem(roomId: string) {
    if (!this.itemText.trim()) return;
    const rooms = this.ins.rooms.map((r:any) => r.id===roomId ? ({...r, items: [...r.items, { id: cryptoRandomId('c_'), text: this.itemText, done:false }]}) : r);
    this.db.updateInspection(this.id, { rooms });
    this.itemText = '';
    this.refresh();
  }

  toggleItem(roomId: string, itemId: string) {
    const rooms = this.ins.rooms.map((r:any)=>{
      if (r.id!==roomId) return r;
      const items = r.items.map((i:any)=> i.id===itemId ? ({...i, done: !i.done}) : i);
      return { ...r, items };
    });
    this.db.updateInspection(this.id, { rooms });
    this.refresh();
  }

  async addPhotos(ev: Event) {
    const files = Array.from((ev.target as HTMLInputElement).files || []);
    for (const f of files) {
      const dataUrl = await fToDataURL(f);
      this.db.addInspectionPhoto(this.id, dataUrl);
    }
    this.refresh();
  }

  saveNotes() { this.db.updateInspection(this.id, { notes: this.notes }); this.refresh(); }
  setTenantSig(dataUrl: string){ this.db.updateInspection(this.id, { tenantSignature: dataUrl }); this.refresh(); }
  setInspectorSig(dataUrl: string){ this.db.updateInspection(this.id, { inspectorSignature: dataUrl }); this.refresh(); }

  finalize(){ this.db.finalizeInspection(this.id); this.refresh(); }

  exportJSON() {
    const pretty = JSON.stringify(this.ins, null, 2);
    downloadText(`inspection_${this.ins.id}.json`, pretty, 'application/json');
  }

  exportHTML() {
    const html = renderHTML(this.ins);
    downloadText(`inspection_${this.ins.id}.html`, html, 'text/html');
  }
}

function cryptoRandomId(prefix='x_') {
  return prefix + Math.random().toString(36).slice(2,10);
}

function fToDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function renderHTML(ins: any){
  const sig = (s?:string) => s ? `<img src="${s}" style="height:60px"/>` : '<em>No signature</em>';
  const imgs = (ins.photos||[]).map((p:string)=>`<img src="${p}" style="width:140px;height:100px;object-fit:cover;margin:4px;border-radius:8px;border:1px solid #ddd"/>`).join('');
  const rooms = (ins.rooms||[]).map((r:any)=>`
    <h3>${r.name}</h3>
    <ul>${r.items.map((i:any)=>`<li>${i.done?'✅':'⬜️'} ${i.text}</li>`).join('')}</ul>
  `).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Inspection ${ins.id}</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:16px;color:#0f172a}</style></head><body>
  <h1>Inspection (${ins.type})</h1>
  <p><b>Status:</b> ${ins.status} • <b>Scheduled:</b> ${ins.scheduledAt||'-'} • <b>Updated:</b> ${ins.updatedAt}</p>
  <p><b>Occupant:</b> ${ins.occupantName||'-'}</p>
  ${rooms}
  <h3>Photos</h3>
  <div>${imgs||'<em>No photos</em>'}</div>
  <h3>Notes</h3>
  <p>${(ins.notes||'').replace(/</g,'&lt;')}</p>
  <h3>Signatures</h3>
  <div>Tenant: ${sig(ins.tenantSignature)}</div>
  <div>Inspector: ${sig(ins.inspectorSignature)}</div>
  </body></html>`;
}
