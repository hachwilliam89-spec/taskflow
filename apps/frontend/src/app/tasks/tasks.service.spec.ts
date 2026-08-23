import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApiSuccessResponse, PaginatedResult, Task } from '@taskflow/types';
import { environment } from '../../environments/environment';
import { TasksService } from './tasks.service';

// Même philosophie que côté Nest (tasks.service.spec.ts backend) : on ne
// fait pas de vrai appel réseau. HttpTestingController intercepte les
// requêtes émises par HttpClient et laisse LE TEST décider quoi répondre
// (`req.flush(...)`) — donc rapide et déterministe, sans backend qui tourne.
describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TasksService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Échoue le test s'il reste une requête HTTP attendue mais jamais
    // "flush"ée — évite d'oublier silencieusement de répondre à un appel.
    httpMock.verify();
  });

  it('findAll() déballe la réponse (retire l\'enveloppe success/data/timestamp)', () => {
    const fakeTask: Task = {
      id: 1,
      title: 'Ma tâche',
      description: null,
      completed: false,
      createdAt: '2026-08-13T00:00:00.000Z',
      updatedAt: '2026-08-13T00:00:00.000Z',
    };
    const fakeResponse: ApiSuccessResponse<PaginatedResult<Task>> = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        items: [fakeTask],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };

    let result: PaginatedResult<Task> | undefined;
    service.findAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('GET');
    req.flush(fakeResponse);

    expect(result).toEqual(fakeResponse.data);
  });

  it('findAll() transmet page/limit en query params', () => {
    service.findAll({ page: 2, limit: 5 }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/tasks`,
    );
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({
      success: true,
      timestamp: new Date().toISOString(),
      data: { items: [], meta: { page: 2, limit: 5, total: 0, totalPages: 0 } },
    } satisfies ApiSuccessResponse<PaginatedResult<Task>>);
  });
});
