import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/dao/dao_auth.service';

import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

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
    MatIcon,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = signal('admin@example.com');
  password = signal('poliba');
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  isEmailValid() {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(this.email());
  }

  isPasswordValid() {
    return this.password().length >= 6;
  }

  isFormValid() {
    return this.isEmailValid() && this.isPasswordValid();
  }

  login() {
  this.auth.login(this.email(), this.password()).subscribe({
    next: () => {
      const token = this.auth.getToken();
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const role = tokenPayload.role; // Ora il ruolo è nel token

          if (role === 'Amministratore') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/login']);
          }
        } catch (error) {
          this.error.set('Errore nella decodifica del token');
        }
      } else {
        this.error.set('Login fallito: token non ricevuto');
      }
    },
    error: (err) => {
  if (err.error) {
    if (typeof err.error === 'string') {
      this.error.set(err.error);
    } else if (err.error.detail) {
      this.error.set(typeof err.error.detail === 'string' ? err.error.detail : JSON.stringify(err.error.detail));
    } else {
      this.error.set(JSON.stringify(err.error));
    }
  } else {
    this.error.set('Login fallito');
  }
}
  });
}
}
