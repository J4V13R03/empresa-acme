import { ApplicationConfig, LOCALE_ID, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SocialLoginModule, SOCIAL_AUTH_CONFIG, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'es-CL' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(SocialLoginModule),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('774965071692-rsjp1eeqmeqhb373i2bnj2e6temhdsp9.apps.googleusercontent.com'),
          }
        ],
        onError: (err) => console.error('Error Auth:', err)
      } as SocialAuthServiceConfig
    }
  ]
};
