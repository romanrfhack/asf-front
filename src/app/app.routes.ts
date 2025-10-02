import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { About } from './components/about/about';
import { InstallPrompt } from './components/install-prompt/install-prompt';
import { InstallInstructionsComponent } from './components/install-instructions/install-instructions';

export const routes: Routes = [
  { 
    path: '', 
    component: Home,
    title: 'ASFM - Inicio'
  },
  { 
    path: 'about', 
    component: About,
    title: 'ASFM - Acerca de'
  },
  { 
    path: 'install', 
    component: InstallInstructionsComponent,
    title: 'ASFM - Instalar App'
  },
  { path: '**', redirectTo: '' }
];