import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { SocialAuthService, GoogleSigninButtonModule, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, GoogleSigninButtonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private formBuilder = inject(FormBuilder);
  private loginService = inject(Auth);
  private socialAuthService = inject(SocialAuthService);

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user: SocialUser | null) => {
      if (user) {
        this.loginService.loginGoogle(user.idToken!).subscribe({
          next: (data) => {
            console.log('Google login successful:', data);
          }
        });
      }
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.loginService.login(email, password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => console.error('Error al iniciar sesión', err),
    });
  }

  private router = inject(Router);
}
