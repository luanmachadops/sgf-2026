import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/user.entity';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Motoristas não têm role, apenas users
        if (user.type === 'driver') {
            throw new ForbiddenException('Drivers cannot access this resource');
        }

        if (!user.role || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
