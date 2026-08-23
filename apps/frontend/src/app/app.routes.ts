import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'tasks',
    // loadComponent (au lieu d'un simple `component: TaskList`) active le
    // lazy loading : le code de TaskList n'est téléchargé par le
    // navigateur qu'au moment où on navigue vers /tasks, pas au chargement
    // initial de l'app. Pour un projet qui n'a qu'un seul écran ça ne
    // change presque rien, mais c'est une bonne habitude à prendre dès le
    // début plutôt qu'à réintroduire plus tard sur un gros projet.
    loadComponent: () =>
      import('./tasks/task-list/task-list').then((m) => m.TaskList),
  },
  {
    // Quand l'utilisateur arrive sur l'URL racine ('' = rien après le
    // domaine), on le redirige automatiquement vers /tasks — pour l'instant
    // c'est le seul écran de l'app, donc ça évite une page d'accueil vide.
    path: '',
    redirectTo: 'tasks',
    // pathMatch: 'full' précise "redirige seulement si l'URL est EXACTEMENT
    // vide", pas juste "commence par vide" (ce qui serait toujours vrai et
    // court-circuiterait toutes les autres routes).
    pathMatch: 'full',
  },
];
