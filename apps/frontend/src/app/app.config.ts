import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    // provideHttpClient() rend HttpClient injectable dans toute l'app (ex:
    // TasksService). withFetch() dit à HttpClient d'utiliser l'API fetch()
    // native du navigateur plutôt que XMLHttpRequest — c'est la
    // recommandation actuelle d'Angular pour les nouveaux projets.
    provideHttpClient(withFetch()),
  ],
};
