import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiSuccessResponse,
  CreateTaskPayload,
  PaginatedResult,
  Task,
  UpdateTaskPayload,
} from '@taskflow/types';
import { environment } from '../../environments/environment';

export interface TasksQuery {
  page?: number;
  limit?: number;
}

// `@Injectable({ providedIn: 'root' })` = équivalent Angular d'un provider
// NestJS déclaré globalement : Angular crée UNE SEULE instance de ce
// service pour toute l'app (singleton), et l'injecte automatiquement à
// quiconque le demande — pas besoin de le lister dans un module comme en
// Nest (TasksModule), Angular le découvre tout seul.
//
// `inject(HttpClient)` est la syntaxe moderne équivalente à un
// `constructor(private http: HttpClient)` : ça fait la même injection de
// dépendances, juste appelée comme une fonction au lieu de passer par les
// paramètres du constructeur. Pratique quand une classe a beaucoup de
// dépendances ou hérite d'une autre classe.
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  // Chaque méthode HttpClient (get/post/...) renvoie un Observable — pas
  // une Promise. Un Observable ne "fait" rien tant que personne ne s'y
  // abonne (`.subscribe(...)`) : c'est un flux paresseux (lazy), contrairement
  // à une Promise qui se lance dès sa création. C'est le composant qui
  // appellera cette méthode (prochaine étape) qui décidera QUAND s'abonner
  // — typiquement via le pipe `async` dans le template, ou `toSignal()`.
  findAll(query: TasksQuery = {}): Observable<PaginatedResult<Task>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http
      .get<ApiSuccessResponse<PaginatedResult<Task>>>(this.baseUrl, { params })
      .pipe(
        // Le backend enveloppe TOUJOURS ses réponses dans { success, data,
        // timestamp } (voir TransformInterceptor). Le frontend n'a pas
        // besoin de connaître cette enveloppe partout dans le code — on la
        // "déballe" une fois pour toutes ici, et le reste de l'app
        // manipule directement des PaginatedResult<Task>/Task.
        map((response) => response.data),
      );
  }

  findOne(id: number): Observable<Task> {
    return this.http
      .get<ApiSuccessResponse<Task>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateTaskPayload): Observable<Task> {
    return this.http
      .post<ApiSuccessResponse<Task>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  // http.patch() : même principe que .get()/.post(), juste le verbe HTTP
  // qui change — il correspond exactement à @Patch(':id') côté Nest, y
  // compris la sémantique "mise à jour partielle" (on n'envoie que
  // { completed: true }, pas toute la tâche).
  update(id: number, payload: UpdateTaskPayload): Observable<Task> {
    return this.http
      .patch<ApiSuccessResponse<Task>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }
}
