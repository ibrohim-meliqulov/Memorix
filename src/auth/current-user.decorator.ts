// src/auth/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt.strategy';

export interface CurrentUserData {
    userId: number;
    telegramId: string;
}

/**
 * Controller'da ishlatish:
 * findAll(@CurrentUser() user: CurrentUserData) {
 *   return this.service.findAllByUser(user.userId);
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CurrentUserData => {
        const request = ctx.switchToHttp().getRequest();
        return request.user; // JwtStrategy.validate() dan keladi
    },
);