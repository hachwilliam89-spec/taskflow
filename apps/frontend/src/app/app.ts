import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Composant "racine" : monté une seule fois, sert de coquille (header +
// zone où le router affiche l'écran courant). C'est l'équivalent du
// AppModule côté Nest question rôle, sauf qu'ici c'est un composant, pas
// un module — Angular moderne n'utilise plus les NgModules par défaut.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'TaskFlow';
}
