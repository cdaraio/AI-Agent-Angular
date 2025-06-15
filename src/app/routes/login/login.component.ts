import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/dao/dao_auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

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
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Form signals
  email = signal('admin@example.com');
  password = signal('poliba');
  firstName = signal('');
  lastName = signal('');
  confirmPassword = signal('');
  isRegisterMode = signal(false);
  message = signal('');
  isError = signal(false);

  isLoading = signal(false)
  // Computed properties
  showEmailError = computed(() => !this.isEmailValid() && this.email().length > 0);
  showPasswordError = computed(() => !this.isPasswordValid() && this.password().length > 0);
  showConfirmPasswordError = computed(() =>
    !this.isConfirmPasswordValid() && this.confirmPassword().length > 0
  );

  // Particles animation
  particles = signal<Particle[]>(this.generateParticles());

  constructor(private auth: AuthService, private router: Router) {}

  // Utility methods
  private generateParticles(): Particle[] {
  const colors = [
    'rgba(96, 165, 250, 0.3)',  // bg-blue-400/30
    'rgba(129, 140, 248, 0.3)', // bg-indigo-400/30
    'rgba(167, 139, 250, 0.3)'  // bg-purple-400/30
  ];

  const particles = [];

  for (let i = 0; i < 5; i++) {
    const size = Math.floor(Math.random() * 2) + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const top = Math.floor(Math.random() * 80) + 10;
    const left = Math.floor(Math.random() * 80) + 10;
    const delay = Math.floor(Math.random() * 3000);
    const duration = Math.floor(Math.random() * 10000) + 5000;

    particles.push({
      style: `
        width: ${size}px;
        height: ${size}px;
        top: ${top}%;
        left: ${left}%;
        background-color: ${color};
        animation-delay: ${delay}ms;
        animation-duration: ${duration}ms;
      `
    });
  }

  return particles;
}

  // Form validation
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

  // Actions
  toggleMode() {
  this.isRegisterMode.set(!this.isRegisterMode());
  // Resetta i messaggi di errore quando cambi modalità
  this.message.set('');
  this.isError.set(false);
}

  login(): void {
  this.isLoading.set(true);
  this.auth.login(this.email(), this.password()).subscribe({
    next: () => {
      this.isLoading.set(false);
      this.handleLoginSuccess();
    },
    error: (err) => {
      this.isLoading.set(false);
      this.handleError(err);
    }
  });
}
  register(): void {
  this.isLoading.set(true);
  this.auth.register(
    this.firstName(),
    this.lastName(),
    this.email(),
    this.password()
  ).subscribe({
    next: () => {
      this.isLoading.set(false);
      this.handleRegisterSuccess();
    },
    error: (err) => {
      this.isLoading.set(false);
      this.handleError(err);
    }
  });
}

  // Handlers
  private handleLoginSuccess(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.message.set('Login fallito: token non ricevuto');
      this.isError.set(true);
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const role = tokenPayload.role;

      if (role === 'Amministratore') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      this.message.set('Errore nella decodifica del token');
      this.isError.set(true);
    }
  }

  private handleRegisterSuccess(): void {
    this.message.set('Registrazione avvenuta con successo. Effettua login.');
    this.isError.set(false);
    this.isRegisterMode.set(false);
  }

  private handleError(err: any): void {
    let errorMessage = 'An error occurred';

    if (err.error) {
      if (typeof err.error === 'string') {
        errorMessage = err.error;
      } else if (err.error.detail) {
        errorMessage = typeof err.error.detail === 'string'
          ? err.error.detail
          : JSON.stringify(err.error.detail);
      } else {
        errorMessage = JSON.stringify(err.error);
      }
    }

    this.message.set(errorMessage);
    this.isError.set(true);
  }
}
