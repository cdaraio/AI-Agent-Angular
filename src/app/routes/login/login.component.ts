import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/dao/dao_auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../service/dao/dao_chat_service';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

interface Particle {
  style: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Signals per lo stato del componente
  email = signal('admin@example.com');
  password = signal('poliba');
  firstName = signal('');
  lastName = signal('');
  confirmPassword = signal('');
  isRegisterMode = signal(false);
  message = signal('');
  isError = signal(false);
  isLoading = signal(false);

  // Validazioni computate
  showEmailError = computed(() => !this.isEmailValid() && this.email().length > 0);
  showPasswordError = computed(() => !this.isPasswordValid() && this.password().length > 0);
  showConfirmPasswordError = computed(() =>
    !this.isConfirmPasswordValid() && this.confirmPassword().length > 0
  );

  // Animazioni particelle
  particles = signal<Particle[]>(this.generateParticles());

  // Iniezione dipendenze
  private auth = inject(AuthService);
  private chatService = inject(ApiService);
  private router = inject(Router);

  // Validazione form completa
  isFormValid = computed(() => {
    if (this.isRegisterMode()) {
      return this.isEmailValid() &&
        this.isPasswordValid() &&
        this.isConfirmPasswordValid() &&
        this.firstName().trim().length > 0 &&
        this.lastName().trim().length > 0;
    }
    return this.isEmailValid() && this.isPasswordValid();
  });

  private generateParticles(): Particle[] {
    const colors = [
      'rgba(96, 165, 250, 0.3)',
      'rgba(129, 140, 248, 0.3)',
      'rgba(167, 139, 250, 0.3)'
    ];

    return Array.from({ length: 5 }, () => ({
      style: `
        width: ${Math.floor(Math.random() * 2) + 2}px;
        height: ${Math.floor(Math.random() * 2) + 2}px;
        top: ${Math.floor(Math.random() * 80) + 10}%;
        left: ${Math.floor(Math.random() * 80) + 10}%;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.floor(Math.random() * 3000)}ms;
        animation-duration: ${Math.floor(Math.random() * 10000) + 5000}ms;
      `
    }));
  }

  // Validazione form
  isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.email());
  }

  isPasswordValid(): boolean {
    return this.password().length >= 6;
  }

  isConfirmPasswordValid(): boolean {
    return this.password() === this.confirmPassword();
  }

  // Azioni
  toggleMode() {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.message.set('');
    this.isError.set(false);
  }

  login(): void {
    if (!this.isFormValid()) return;

    this.isLoading.set(true);
    this.auth.login(this.email(), this.password()).pipe(
      tap(() => this.handleLoginSuccess()),
      catchError(err => {
        this.handleError(err);
        return EMPTY;
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }

  register(): void {
    if (!this.isFormValid()) return;

    this.isLoading.set(true);
    this.auth.register(
      this.firstName(),
      this.lastName(),
      this.email(),
      this.password()
    ).pipe(
      tap(() => this.handleRegisterSuccess()),
      catchError(err => {
        this.handleError(err);
        return EMPTY;
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }

  private async handleLoginSuccess(): Promise<void> {
    const token = this.auth.getToken();
    if (!token) {
      this.handleError('Login fallito: token non ricevuto');
      return;
    }

    try {
      const tokenPayload = this.auth.parseJwt(token);
      const role = tokenPayload.role;

      if (role === 'Amministratore') {
        await this.router.navigate(['/admin']);
        return;
      }

      // Crea nuova chat e reindirizza
      const chat = await this.chatService.createNewChat().toPromise();
      if (chat?.chat_id) {
        await this.router.navigate(['/chats', chat.chat_id]);
      } else {
        throw new Error('ID chat non ricevuto');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      this.handleError(
        error instanceof Error ? error.message : 'Errore durante il login'
      );
    }
  }

  private handleRegisterSuccess(): void {
    this.message.set('Registrazione avvenuta con successo. Effettua login.');
    this.isError.set(false);
    this.isRegisterMode.set(false);
  }

  private handleError(err: any): void {
    const errorMessage = err.error?.detail ||
                        err.error?.message ||
                        err.message ||
                        'Si è verificato un errore';
    this.message.set(errorMessage);
    this.isError.set(true);
  }
}
