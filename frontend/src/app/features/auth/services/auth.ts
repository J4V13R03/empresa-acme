import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  apiUrl = 'http://localhost:3000';

  isAutenticated = signal<boolean>(!!localStorage.getItem('token'));

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.isAutenticated.set(true);
      })
    );
  }

  loginGoogle(token: string) {
    const header = { 'Content-Type': 'application/json' };
    let googleToken = { token: token };
    return this.http.post(`${this.apiUrl}/google-login`, googleToken, { headers: header }).pipe(
      map((resp: any) => {
        console.log('Login with Google successful:', resp);
        localStorage.setItem('token', resp.token);
        localStorage.setItem('usuario', JSON.stringify(resp.usuario));
        this.isAutenticated.set(true);
        this.router.navigate(['/home']);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.isAutenticated.set(false);
  }
}
