import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
//import { EventEmitter } from 'stream';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './install-prompt.html',
  styleUrl: './install-prompt.css'
})
export class InstallPrompt {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    console.log('onClose called'); // Agregar esto para debug
    this.close.emit();
    console.log('close event emitted'); // Agregar esto para debug
  }

}
