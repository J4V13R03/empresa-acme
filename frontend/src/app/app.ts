import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { Auth } from './features/auth/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = signal('Empresa ACME');
  authService = inject(Auth);
  private router = inject(Router);

  logout() {
    this.authService.logout();       // Limpia token y cambia la señal a false
    this.router.navigate(['/login']); // Patea al usuario a la vista de login
  }
}