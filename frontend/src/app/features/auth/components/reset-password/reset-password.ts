import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private formBuilder = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  apiUrl = 'http://localhost:3000';
  success = signal(false);
  loading = signal(false);
  error = signal('');
  token = '';

  resetForm: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  resetPassword() {
    if (this.resetForm.invalid) return;

    const { code, newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.http.post(`${this.apiUrl}/reset-password`, {
      token: this.token,
      code,
      newPassword,
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al cambiar la contraseña');
        this.loading.set(false);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
