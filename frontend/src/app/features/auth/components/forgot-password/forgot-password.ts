import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private formBuilder = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  apiUrl = 'http://localhost:3000';
  sent = signal(false);
  loading = signal(false);
  error = signal('');

  forgotForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  sendRecovery() {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { email } = this.forgotForm.value;
    this.http.post(`${this.apiUrl}/forgot-password`, { email }).subscribe({
      next: () => {
        this.sent.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al enviar el correo. Intentá de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
