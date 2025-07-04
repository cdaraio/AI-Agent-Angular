import { Routes } from '@angular/router';
import { LoginComponent } from './routes/login/login.component';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './routes/admin/layout/layout/layout.component';
import { BookingResolver } from './service/resolver/bookings.resolver';
import { UtentiResolver } from './service/resolver/utenti.resolver';
import { ChatComponent } from './routes/chat/chat.component';
import { ChatResolver } from './service/resolver/chat.resolver';
import { PaginaNonTrovataComponent } from './components/pagina-non-trovata/pagina-non-trovata.component';

export const routes: Routes = [
  {path: 'login', component: LoginComponent },
  { path: 'chats/:id', component: ChatComponent, canActivate: [authGuard], resolve: { messages: ChatResolver }},
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'users', loadComponent: () => import('./routes/admin/utenti/utenti.component').then(m => m.UtentiComponent),
        resolve: {
          utenti: UtentiResolver
        }
      },
      {
        path: 'bookings',
        loadComponent: () => import('./routes/admin/prenotazioni/prenotazioni/prenotazioni.component').then(m => m.PrenotazioniComponent),
        resolve: {
          prenotazioni: BookingResolver
        }
      },
      { path: 'bookings/edit/:id', loadComponent: () => import('./routes/admin/prenotazioni/prenotazione/prenotazione/prenotazione.component').then(m => m.PrenotazioneComponent) },
      { path: 'rooms', loadComponent: () => import('./routes/admin/sale/sale.component').then(m => m.SaleComponent) },
      { path: 'dashboard', loadComponent: () => import('./routes/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'new', loadComponent: () => import('./routes/admin/signin/signin/signin.component').then(m => m.SigninComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: PaginaNonTrovataComponent }
];
