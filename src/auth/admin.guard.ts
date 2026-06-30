// src/auth/admin.guard.ts

import {
    Injectable,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Avval JwtAuthGuard kabi ishlaydi (token tekshiradi, req.user to'ldiradi),
 * keyin qo'shimcha: req.user.email === ADMIN_EMAIL bo'lishi shart.
 *
 * Ishlatish: @UseGuards(AdminGuard)
 */
@Injectable()
export class AdminGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Avval oddiy JWT tekshiruvi (token bor/yo'q, muddati o'tganmi)
        const isAuthenticated = (await super.canActivate(context)) as boolean;
        if (!isAuthenticated) return false;

        // 2. Email admin emailga teng ekanini tekshiramiz
        const request = context.switchToHttp().getRequest();
        const user = request.user; // JwtStrategy.validate() dan: { userId, email }

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            throw new ForbiddenException('ADMIN_EMAIL sozlanmagan (.env tekshiring)');
        }

        if (!user?.email || user.email !== adminEmail) {
            throw new ForbiddenException("Sizda admin huquqi yo'q");
        }

        return true;
    }
}