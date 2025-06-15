import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../service/dao/dao_auth.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  // Segnali per stato e messaggi
  error = signal('');
  success = signal('');
  isLoading = signal(false);

  // Form reattivo
  registrationForm: FormGroup;

  // Iniezione delle dipendenze
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registrationForm = this.fb.nonNullable.group({
      nome: ['', [Validators.required, Validators.maxLength(12)]],
      cognome: ['', [Validators.required, Validators.maxLength(12)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator() });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { mismatch: true };
    };
  }

  register() {
    if (this.registrationForm.invalid) {
      this.error.set('Compila correttamente tutti i campi.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.success.set('');

    const { nome, cognome, email, password } = this.registrationForm.value;

    this.auth.registerAdmin(nome!, cognome!, email!, password!).subscribe({
      next: (response) => {
        this.success.set('Registrazione avvenuta con successo!');
        this.isLoading.set(false);
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Errore durante la registrazione');
        this.isLoading.set(false);
      }
    });
  }
}
