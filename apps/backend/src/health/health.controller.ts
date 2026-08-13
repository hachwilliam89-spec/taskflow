import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { PrismaHealthIndicator } from './prisma.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  // @HealthCheck() fait tourner tous les indicateurs passés au tableau en
  // parallèle, agrège leurs résultats, et renvoie 200 si TOUS sont "up",
  // 503 si AU MOINS UN est "down" (avec le détail de chacun dans le body).
  // C'est ce endpoint qu'un orchestrateur (Docker healthcheck, k8s
  // liveness/readiness probe, load balancer...) interroge périodiquement.
  @HealthCheck()
  // Endpoint technique d'infra, pas une ressource métier : on l'exclut de
  // la doc Swagger destinée aux consommateurs de l'API.
  @ApiExcludeEndpoint()
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
    ]);
  }
}
