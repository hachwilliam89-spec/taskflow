import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Filtre global : capture TOUTE exception non gérée (HttpException de Nest
 * comme erreurs inattendues) et les transforme en une réponse JSON unique et
 * prévisible pour le client, au lieu de laisser chaque endpoint gérer son
 * propre format d'erreur.
 *
 * @Catch() sans argument = attrape tout, pas seulement les HttpException.
 * C'est volontaire : une erreur Prisma ou un bug non prévu ne doit jamais
 * faire fuiter une stack trace brute au client, mais doit quand même
 * renvoyer une réponse structurée (en 500).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const body = new ErrorResponseDto({
      statusCode: status,
      message: this.extractMessage(exception, exceptionResponse),
      error: this.extractError(status, exceptionResponse),
      timestamp: new Date().toISOString(),
      path: request.url,
    });

    // Les erreurs serveur (5xx) sont loggées avec leur stack trace complète
    // côté serveur ; le client, lui, ne reçoit jamais ce détail.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private extractMessage(
    exception: unknown,
    exceptionResponse: unknown,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') return exceptionResponse;
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as { message: string | string[] }).message;
    }
    if (exception instanceof Error) return exception.message;
    return 'Internal server error';
  }

  private extractError(status: number, exceptionResponse: unknown): string {
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'error' in exceptionResponse
    ) {
      return (exceptionResponse as { error: string }).error;
    }
    return HttpStatus[status] ?? 'Error';
  }
}
