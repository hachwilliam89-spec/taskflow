import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

// COMMENT ÇA MARCHE :
//
// Un intercepteur Nest s'exécute AUTOUR du handler de route (le "sandwich
// pattern") : le code AVANT `next.handle()` tourne avant que le controller
// ne s'exécute, et ce qu'on fait sur l'Observable RETOURNÉ par
// `next.handle()` s'exécute APRÈS que le controller ait produit sa valeur.
//
// `next.handle()` renvoie un Observable RxJS qui émettra la valeur que le
// controller a return-ée (ex: le tableau de tasks de TasksService.findAll).
// On ne touche pas à cette valeur directement : on la transforme via
// `.pipe(map(...))`, exactement comme on transformerait un tableau avec
// `.map()`, sauf qu'ici ça s'applique à une valeur qui arrive de façon
// asynchrone via un flux (stream) plutôt qu'un array déjà en mémoire.
//
// Résultat concret : le controller continue de simplement `return task` ou
// `return tasks` sans se soucier du format d'enveloppe — c'est cet
// intercepteur, branché UNE FOIS globalement (voir app.module.ts,
// token APP_INTERCEPTOR), qui enveloppe systématiquement toute réponse
// réussie dans `{ success: true, data: ..., timestamp: ... }`.
//
// Symétrie avec HttpExceptionFilter : le filter gère le cas d'erreur
// (exception levée → ErrorResponseDto), l'intercepteur gère le cas de
// succès (valeur retournée normalement → SuccessResponse). À eux deux,
// TOUTE réponse de l'API a une forme prévisible côté frontend.
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
