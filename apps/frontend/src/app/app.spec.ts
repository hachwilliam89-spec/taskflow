import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // App utilise <router-outlet>, qui a besoin qu'un Router soit
      // disponible via injection de dépendances même en test — provideRouter([])
      // fournit un routeur "vide" (aucune route), suffisant ici puisqu'on
      // ne teste pas la navigation.
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('devrait afficher le titre "TaskFlow"', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('TaskFlow');
  });
});
