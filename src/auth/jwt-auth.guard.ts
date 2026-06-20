// src/auth/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Himoyalangan endpointlarda ishlatish uchun:
 * @UseGuards(JwtAuthGuard)
 * Keyin controller'da req.user orqali { userId, telegramId } ni olish mumkin
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }