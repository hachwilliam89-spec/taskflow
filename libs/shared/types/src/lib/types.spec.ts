import { isTask } from './types';

// Les interfaces TypeScript (Task, PaginatedResult, ...) n'existent qu'à la
// compilation — elles disparaissent une fois transpilées en JS, donc rien
// à tester dessus à l'exécution. `isTask`, en revanche, EST du code qui
// s'exécute réellement : c'est lui qu'on teste ici.
describe('isTask', () => {
  it('renvoie true pour un objet avec la forme attendue', () => {
    expect(
      isTask({
        id: 1,
        title: 'Ma tâche',
        description: null,
        completed: false,
        createdAt: '2026-08-13T00:00:00.000Z',
        updatedAt: '2026-08-13T00:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('renvoie false si un champ requis manque ou a le mauvais type', () => {
    expect(isTask({ id: '1', title: 'x', completed: false })).toBe(false);
    expect(isTask({ title: 'x', completed: false })).toBe(false);
    expect(isTask(null)).toBe(false);
    expect(isTask('not an object')).toBe(false);
  });
});
