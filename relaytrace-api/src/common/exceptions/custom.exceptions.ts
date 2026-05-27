import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: id
          ? `${resource} with id ${id} not found`
          : `${resource} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
      },
      HttpStatus.CONFLICT,
    );
  }
}

// 402 — plan upgrade required ─────────────────────────────────────────────────

export class FeatureNotAvailableException extends HttpException {
  constructor(feature: string, currentPlan: string) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'plan_upgrade_required',
        message: `La función "${feature}" no está disponible en el plan ${currentPlan}. Actualiza tu plan para acceder.`,
        currentPlan,
        requiredFeature: feature,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

export class PlanLimitExceededException extends HttpException {
  constructor(
    resource: string,
    current: number,
    limit: number,
    plan: string,
  ) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'plan_limit_exceeded',
        message: `Límite de ${resource} alcanzado (${current}/${limit}) en el plan ${plan}. Actualiza tu plan para agregar más.`,
        current,
        limit,
        plan,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
