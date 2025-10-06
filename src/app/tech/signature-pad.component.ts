import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class='border rounded p-2 bg-white'>
    <canvas #c class='w-full h-40 border rounded'></canvas>
    <div class='mt-2 flex gap-2'>
      <button (click)='clear()' class='px-3 py-1 rounded border'>Clear</button>
      <button (click)='save()' class='px-3 py-1 rounded bg-slate-900 text-white'>Save</button>
    </div>
    <div *ngIf='existing' class='text-xs text-slate-500 mt-2'>Existing signature loaded.</div>
  </div>
  `
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('c') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() existing: string | undefined;
  @Output() saved = new EventEmitter<string>();
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    if (this.existing) this.loadExisting(this.existing);
  }

  @HostListener('window:resize') resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const prev = this.ctx ? this.canvasRef.nativeElement.toDataURL() : null;
    canvas.width = rect.width;
    canvas.height = 160;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#111827';
    if (prev) this.loadExisting(prev);
  }

  private loadExisting(dataUrl: string) {
    const img = new Image();
    img.onload = () => this.ctx.drawImage(img, 0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    img.src = dataUrl;
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  save() {
    const canvas = this.canvasRef.nativeElement;
    const data = canvas.toDataURL('image/png');
    this.saved.emit(data);
  }

  // pointer events
  onDown = (e: PointerEvent) => { this.drawing = true; this.ctx.beginPath(); this.ctx.moveTo(e.offsetX, e.offsetY); };
  onMove = (e: PointerEvent) => { if (!this.drawing) return; this.ctx.lineTo(e.offsetX, e.offsetY); this.ctx.stroke(); };
  onUp = () => { this.drawing = false; };

  constructor() {
    setTimeout(() => {
      const c = this.canvasRef?.nativeElement;
      if (!c) return;
      c.addEventListener('pointerdown', this.onDown);
      c.addEventListener('pointermove', this.onMove);
      window.addEventListener('pointerup', this.onUp);
    });
  }
}
