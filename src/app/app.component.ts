import { Component, signal, HostListener } from '@angular/core';
import { InstallPrompt } from "./components/install-prompt/install-prompt";
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,     
    InstallPrompt],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {  
    showInstallButton = false;
  showInstallPrompt = false;
  private deferredPrompt: any;

  constructor() {
    // Para debug
    console.log('AppComponent initialized');
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event) {
    console.log('beforeinstallprompt event received');
    event.preventDefault();
    this.deferredPrompt = event;
    this.showInstallButton = true;
  }

  // Método para debug
  onModalClose() {
    console.log('Modal close received in parent, showInstallPrompt was:', this.showInstallPrompt);
    this.showInstallPrompt = false;
    console.log('Modal close received in parent, showInstallPrompt now:', this.showInstallPrompt);
  }

  installPwa() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó la instalación');
        }
        this.deferredPrompt = null;
        this.showInstallButton = false;
      });
    }
  }

  onInstallPromptClose() {
    console.log('Install prompt close received in parent');
    this.showInstallPrompt = false;
  }
}