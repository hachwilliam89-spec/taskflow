import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
// Ce fichier n'existe pas encore — c'est volontaire, première brique du
// "rouge" : le simple fait que ce fichier soit introuvable va déjà faire
// planter le test (erreur "Cannot find module"), avant même de parler de
// logique métier.
import { UpdateTaskDto } from './dto/update-task.dto';

// On ne se connecte PAS à une vraie base de données dans un test unitaire :
// on remplace PrismaService par un faux objet dont chaque méthode utilisée
// est un jest.fn() — on contrôle nous-mêmes ce qu'il "répond", et on
// vérifie ensuite QUELS arguments TasksService lui a passés. C'est ça qui
// rend le test rapide et déterministe (pas de Docker/réseau nécessaire pour
// lancer `pnpm nx test backend`).
describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      task: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
  });

  describe('findAll (pagination)', () => {
    // Ce test est celui écrit "en premier" dans la démarche TDD : au moment
    // où on l'écrit, TasksService.findAll() ne prend encore aucun
    // paramètre et retourne juste un tableau — donc CE TEST ÉCHOUE (rouge)
    // tant que la pagination n'est pas implémentée. C'est volontaire :
    // le test décrit le comportement attendu AVANT que le code existe.
    // La suite (tasks.service.ts mis à jour juste après) est le "vert" :
    // le code minimal qui fait passer ce test.
    it('interroge Prisma avec skip/take dérivés de page/limit, et renvoie items + meta', async () => {
      const dto = new PaginationQueryDto();
      dto.page = 2;
      dto.limit = 5;

      const fakeTasks = [{ id: 6, title: 'Task 6' }];
      prisma.task.findMany.mockResolvedValue(fakeTasks);
      prisma.task.count.mockResolvedValue(12);

      const result = await service.findAll(dto);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 5, // (page 2 - 1) * limit 5
        take: 5,
      });
      expect(result).toEqual({
        items: fakeTasks,
        meta: { page: 2, limit: 5, total: 12, totalPages: 3 },
      });
    });

    it('utilise page=1/limit=20 par défaut si aucun paramètre fourni', async () => {
      prisma.task.findMany.mockResolvedValue([]);
      prisma.task.count.mockResolvedValue(0);

      await service.findAll(new PaginationQueryDto());

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('renvoie la tâche si elle existe', async () => {
      const task = { id: 1, title: 'Task 1' };
      prisma.task.findUnique.mockResolvedValue(task);

      await expect(service.findOne(1)).resolves.toEqual(task);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('lève NotFoundException si la tâche n\'existe pas', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crée une tâche via prisma.task.create', async () => {
      const dto = { title: 'Nouvelle tâche' };
      const created = { id: 1, ...dto };
      prisma.task.create.mockResolvedValue(created);

      await expect(service.create(dto as never)).resolves.toEqual(created);
      expect(prisma.task.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  // Le comportement attendu, écrit AVANT que update() n'existe sur
  // TasksService : à ce stade, `service.update` n'existe même pas encore,
  // donc TypeScript va refuser de compiler ce fichier — c'est le "rouge",
  // juste sous une autre forme qu'un test qui s'exécute et échoue.
  describe('update', () => {
    it('vérifie que la tâche existe (réutilise findOne), puis appelle prisma.task.update', async () => {
      const existing = { id: 1, title: 'Task 1', completed: false };
      const updated = { ...existing, completed: true };
      // findUnique est utilisé en interne par findOne() pour vérifier que
      // la tâche existe avant de la modifier.
      prisma.task.findUnique.mockResolvedValue(existing);
      prisma.task.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { completed: true };

      await expect(service.update(1, dto)).resolves.toEqual(updated);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
    });

    it("lève NotFoundException si la tâche n'existe pas, et n'appelle jamais prisma.task.update", async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { completed: true })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.task.update).not.toHaveBeenCalled();
    });
  });
});
