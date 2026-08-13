import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

// Indicateur "maison" : Terminus ne fournit pas de check Prisma tout fait
// (contrairement à TypeOrmHealthIndicator par ex.), donc on l'écrit
// nous-mêmes. Le principe est toujours le même quel que soit l'ORM/driver :
// exécuter une requête minimale, et si elle réussit → "up", si elle lève →
// "down".
@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  async isHealthy(key: string) {
    // healthIndicatorService.check(key) crée un "constructeur de résultat"
    // pour cette clé — c'est lui qui formate la réponse finale attendue par
    // HealthCheckService (voir health.controller.ts).
    const indicator = this.healthIndicatorService.check(key);

    try {
      // "SELECT 1" : la requête la plus légère possible, on ne veut pas
      // tester la logique métier, juste "la connexion DB répond-elle ?".
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
