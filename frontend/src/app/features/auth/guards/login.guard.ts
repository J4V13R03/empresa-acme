import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Si la señal reactiva indica que está autenticado, permite el paso
  if (authService.isAutenticated()) {
    return true;
  }

  // Si no hay token o sesión activa, redirige inmediatamente al login y deniega el acceso
  router.navigate(['/login']);
  return false;
};
