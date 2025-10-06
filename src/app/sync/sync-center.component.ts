import { Component } from '@angular/core';
import { NgFor, DatePipe, JsonPipe } from '@angular/common';
import { OfflineService } from '../core/offline.service';

@Component({
  selector: 'sync-center',
  standalone: true,
  imports: [NgFor, DatePipe, JsonPipe],
  templateUrl: './sync-center.component.html'
})
export class SyncCenterComponent {
  constructor(public offline: OfflineService) {}
  flush(){ this.offline.flush(); }
  clear(){ this.offline.clear(); }
}
