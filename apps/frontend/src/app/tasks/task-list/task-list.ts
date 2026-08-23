import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '@taskflow/types';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-task-list',
  // Comme pour App (imports: [RouterOutlet]) : ce composant utilise
  // [(ngModel)] dans son template, donc il doit importer FormsModule pour
  // qu'Angular sache quoi en faire. FormsModule est encore un NgModule
  // "à l'ancienne" — la partie formulaires d'Angular n'a pas (encore) de
  // version 100% fonction comme inject()/input().
  imports: [FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
  private readonly tasksService = inject(TasksService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly isLoading = signal(true);

  // Propriété NORMALE (pas un signal) : elle ne sert qu'à retenir ce que
  // l'utilisateur tape dans le champ, un état purement local et temporaire
  // au formulaire. [(ngModel)] a besoin d'une propriété qu'il peut
  // réassigner directement (newTitle = "..."), ce qu'un signal ne permet
  // pas nativement (il faudrait passer par .set()) — donc ici, une
  // propriété simple est le bon outil, pas un signal.
  protected newTitle = '';

  ngOnInit(): void {
    this.tasksService.findAll().subscribe({
      next: (result) => {
        this.tasks.set(result.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tâches', err);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    // trim() : enlève les espaces avant/après. Si l'utilisateur n'a tapé
    // que des espaces (ou rien), on ne fait rien — pas la peine d'appeler
    // l'API pour ça (le backend le refuserait de toute façon, grâce à
    // @MinLength() sur CreateTaskDto, mais autant éviter l'appel inutile).
    const title = this.newTitle.trim();
    if (!title) {
      return;
    }

    this.tasksService.create({ title }).subscribe({
      next: (task) => {
        // .update() (au lieu de .set()) : on lui passe une FONCTION qui
        // reçoit la valeur actuelle du signal (current = le tableau de
        // tâches déjà affiché) et renvoie la nouvelle valeur. Ici, on
        // construit un nouveau tableau avec la tâche fraîchement créée en
        // premier, suivie des anciennes — pas besoin de refaire un appel à
        // GET /tasks juste pour voir la nouvelle tâche apparaître.
        this.tasks.update((current) => [task, ...current]);
        // Vide le champ : comme newTitle est lié par [(ngModel)], le
        // changer ICI (côté classe) met aussi à jour l'affichage du champ
        // — le two-way binding marche dans les deux sens.
        this.newTitle = '';
      },
      error: (err) => {
        console.error('Erreur lors de la création de la tâche', err);
      },
    });
  }

  protected toggleCompleted(task: Task): void {
    this.tasksService
      .update(task.id, { completed: !task.completed })
      .subscribe({
        next: (updated) => {
          // .map() construit un NOUVEAU tableau où seule la tâche
          // concernée est remplacée par sa version à jour — les autres
          // sont recopiées telles quelles. On ne modifie jamais un objet
          // Task existant "sur place" (ex: task.completed = true) : on
          // remplace toujours par un nouvel objet. C'est important pour
          // qu'Angular détecte correctement le changement.
          this.tasks.update((current) =>
            current.map((t) => (t.id === updated.id ? updated : t)),
          );
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la tâche', err);
        },
      });
  }
}
