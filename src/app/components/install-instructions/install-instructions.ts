import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-install-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './install-instructions.html',
  styleUrls: ['./install-instructions.css']
})
export class InstallInstructionsComponent {
  // Este componente solo muestra las instrucciones, no tiene lógica de modal
}