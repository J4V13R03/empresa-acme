import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-recovery-game',
  imports: [ReactiveFormsModule],
  templateUrl: './recovery-game.html',
  styleUrl: './recovery-game.css',
})
export class RecoveryGame implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private formBuilder = inject(FormBuilder);
  private ngZone = inject(NgZone);

  apiUrl = 'http://localhost:3000';
  token = '';
  phase = signal<'swipe' | 'code' | 'form' | 'done'>('swipe');
  loading = signal(true);
  error = signal('');
  saving = signal(false);
  successMsg = signal('');
  code = signal('');

  private swipeX = 0;
  private isDragging = false;
  private startX = 0;
  private cardEl: HTMLElement | null = null;
  swipeSuccess = false;

  private boundOnMove = this.onDocumentMove.bind(this);
  private boundOnUp = this.onDocumentUp.bind(this);

  resetForm: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error.set('Token no válido');
      this.loading.set(false);
      return;
    }

    this.http.get<any>(`${this.apiUrl}/verify-recovery-token/${this.token}`).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.error.set('Token expirado o inválido.');
        this.loading.set(false);
      },
    });
  }

  onPointerDown(e: MouseEvent | TouchEvent) {
    if (this.swipeSuccess) return;

    // Obtener el elemento directamente del evento — no depende de ViewChild
    this.cardEl = (e.target as HTMLElement).closest('[data-swipe-card]') as HTMLElement;
    if (!this.cardEl) return;

    this.isDragging = true;
    this.startX = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;

    document.addEventListener('mousemove', this.boundOnMove);
    document.addEventListener('mouseup', this.boundOnUp);
    document.addEventListener('touchmove', this.boundOnMove, { passive: false });
    document.addEventListener('touchend', this.boundOnUp);
  }

  private onDocumentMove(e: MouseEvent | TouchEvent) {
    if (!this.isDragging || !this.cardEl) return;
    e.preventDefault();
    const x = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
    this.swipeX = Math.max(0, x - this.startX);
    this.cardEl.style.transform = `translateX(${this.swipeX}px)`;
  }

  private onDocumentUp() {
    if (!this.isDragging) return;
    this.isDragging = false;

    document.removeEventListener('mousemove', this.boundOnMove);
    document.removeEventListener('mouseup', this.boundOnUp);
    document.removeEventListener('touchmove', this.boundOnMove);
    document.removeEventListener('touchend', this.boundOnUp);

    if (this.swipeX >= 200 && this.cardEl) {
      this.swipeSuccess = true;
      this.cardEl.style.transform = 'translateX(250px)';
      this.cardEl.style.borderColor = '#00ff41';

      this.ngZone.run(() => {
        this.http.post<any>(`${this.apiUrl}/get-recovery-code`, { token: this.token }).subscribe({
          next: (res) => {
            this.code.set(res.code);
            this.phase.set('code');
          },
          error: () => {
            this.code.set(this.decodeToken());
            this.phase.set('code');
          },
        });
      });
    } else if (this.cardEl) {
      this.swipeX = 0;
      this.cardEl.style.transform = 'translateX(0)';
    }
  }

  private decodeToken(): string {
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.code || '000000';
    } catch {
      return '000000';
    }
  }

  copyCode() {
    navigator.clipboard.writeText(this.code());
  }

  goToForm() {
    this.resetForm.patchValue({ code: this.code() });
    this.phase.set('form');
  }

  resetPassword() {
    if (this.resetForm.invalid) return;

    const { code, newPassword, confirmPassword } = this.resetForm.value;
    if (newPassword !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    this.http.post(`${this.apiUrl}/reset-password`, {
      token: this.token,
      code,
      newPassword,
    }).subscribe({
      next: (res: any) => {
        this.successMsg.set(res.mensaje);
        this.phase.set('done');
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al cambiar la contraseña');
        this.saving.set(false);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
