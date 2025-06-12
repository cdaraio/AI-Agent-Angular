import { Routes } from '@angular/router';
import { LoginComponent } from './routes/login/login.component';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './routes/admin/layout/layout/layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
     // { path: 'dashboard', loadComponent: () => import('./routes/admin/prenotazioni/prenotazioni.component').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./routes/admin/utenti/utenti.component').then(m => m.UtentiComponent) },
      { path: 'bookings', loadComponent: () => import('./routes/admin/prenotazioni/prenotazioni/prenotazioni.component').then(m => m.PrenotazioniComponent) },
      { path: 'bookings/edit/:id', loadComponent: () => import('./routes/admin/prenotazioni/prenotazione/prenotazione/prenotazione.component').then(m => m.PrenotazioneComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
