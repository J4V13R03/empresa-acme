import { Routes } from '@angular/router';
import { WelcomeComponent } from './features/home/welcome';
import { ProductComponent } from './features/product/product';
import { Login } from './features/auth/components/login/login';
import { UserComponent } from './features/users/user/user';
import { ProductPaginationComponent } from './features/product/product-pagination/product-pagination';
import { loginGuard } from './features/auth/guards/login.guard';
import { MapComponent } from './features/maps/components/map/map';
import { ProductSales } from './features/dashboards/components/product-sales/product-sales';
import { TopRankingComponent } from './features/dashboards/components/top-ranking/top-ranking';
import { ForgotPassword } from './features/auth/components/forgot-password/forgot-password';
import { RecoveryGame } from './features/auth/components/recovery-game/recovery-game';
import { ResetPassword } from './features/auth/components/reset-password/reset-password';
import { PageNotFound } from './features/not-found/page-not-found/page-not-found';

export const routes: Routes = [
  // Rutas protegidas por el guardia de seguridad
  { path: 'home', component: WelcomeComponent, canActivate: [loginGuard] },
  { path: 'maps', component: MapComponent, canActivate: [loginGuard] },
  { path: 'products', component: ProductComponent, canActivate: [loginGuard] },
  { path: 'products-sales', component: ProductSales, canActivate: [loginGuard] },
  { path: 'top-ranking', component: TopRankingComponent, canActivate: [loginGuard] },
  { path: 'product-pagination', component: ProductPaginationComponent, canActivate: [loginGuard] },
  { path: 'users', component: UserComponent, canActivate: [loginGuard] },

  // Rutas de recuperación de contraseña (públicas)
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'recover/:token', component: RecoveryGame },
  { path: 'reset-password/:token', component: ResetPassword },

  // Ruta pública de acceso
  { path: 'login', component: Login },

  // Redirección por defecto
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Página no encontrada
  { path: '**', component: PageNotFound }
];

