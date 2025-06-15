// auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utente } from '../../model/utente';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.backendUrl + '/utenti/login';

  token = signal<string | null>(null);
  user = signal<Utente | null>(null);
  isAuthenticated = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    this.token.set(savedToken);
    this.user.set(savedUser ? JSON.parse(savedUser) : null);
    this.isAuthenticated.set(!!savedToken);
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}`, { email, password }
    ).pipe(
      tap((response) => {
        const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));

        const utente = new Utente(
          tokenPayload.sub, // Usa 'sub' che contiene l'email
          response.token,
          tokenPayload.role // Ruolo dal token
        );

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(utente));
        this.token.set(response.token);
        this.user.set(utente);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.token.set(null);
    this.user.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  getUser(): Utente | null {
    return this.user();
  }

  hasRole(ruolo: string): boolean {
    return this.user()?.ruolo === ruolo;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated() && this.isTokenValid();
  }

  isTokenValid(): boolean {
    const token = this.token();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
  registerAdmin(nome: string, cognome: string, email: string, password: string) {
    return this.http.post<{ user_id: number, ruolo: string }>(
      `${environment.backendUrl}/admin/new`,
      { nome, cognome, email, password }
    );
  }

  register(nome: string, cognome: string, email: string, password: string) {
    return this.http.post<{ user_id: number }>(
      `${environment.backendUrl}/utenti/new`,
      { nome, cognome, email, password }
    );
  }
}
