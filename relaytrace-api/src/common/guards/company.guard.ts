import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('No company context');
    }

    // Attach company context al request para uso posterior
    request.companyId = user.companyId;

    return true;
  }
}
