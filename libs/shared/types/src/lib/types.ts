// Ce lib partagé (libs/shared/types) est compilé une seule fois et importable
// depuis n'importe quel projet du monorepo via l'alias "@taskflow/types"
// (voir tsconfig.base.json) — donc à la fois depuis apps/backend ET
// apps/frontend. L'intérêt : le frontend ne "devine" jamais la forme des
// données envoyées par l'API, il importe le même type que celui que Prisma
// génère côté backend (adapté ici en interface simple, car ce lib n'a pas
// accès au client Prisma généré).

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  // Les dates traversent JSON en string ISO 8601 (ex: "2026-08-13T08:24:20.288Z"),
  // jamais en objet Date — HTTP ne transporte que du texte. C'est au
  // composant Angular qui affiche la date de la reformater si besoin
  // (avec le pipe `date` d'Angular par exemple).
  createdAt: string;
  updatedAt: string;
}

// Ce que le frontend envoie pour créer une tâche — reflète les champs
// acceptés par CreateTaskDto côté Nest (apps/backend/src/tasks/dto/create-task.dto.ts).
export interface CreateTaskPayload {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// Reflète exactement l'enveloppe posée par TransformInterceptor côté Nest
// (apps/backend/src/common/interceptors/transform.interceptor.ts) sur
// TOUTE réponse réussie de l'API.
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

// Reflète ErrorResponseDto, posée par HttpExceptionFilter côté Nest sur
// toute erreur de l'API.
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

// Garde de type ("type guard") : une fonction qui vérifie À L'EXÉCUTION
// qu'une valeur a bien la forme d'un Task, et dont le type de retour
// `value is Task` dit à TypeScript "si cette fonction renvoie true, tu peux
// traiter `value` comme un Task dans le code qui suit". Utile si un jour
// le frontend reçoit une donnée dont la forme n'est pas garantie par le
// typage statique (ex: réponse d'une API tierce, donnée en cache localStorage...).
export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'number' &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['completed'] === 'boolean'
  );
}
