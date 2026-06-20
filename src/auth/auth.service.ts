// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { validateTelegramInitData } from './telegram-validator';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private jwtService: JwtService,
    ) { }

    /**
     * Telegram Mini App orqali login:
     * 1. initData ni tasdiqlaydi (Telegram'dan ekanligini tekshiradi)
     * 2. User mavjud bo'lmasa -> yaratadi
     * 3. JWT token qaytaradi
     */
    async loginWithTelegram(initData: string) {
        const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN .env faylda sozlanmagan');
        }

        let parsed;
        try {
            parsed = validateTelegramInitData(initData, botToken);
        } catch (error) {
            this.logger.warn(`Telegram auth rad etildi: ${error.message}`);
            throw new UnauthorizedException("Telegram autentifikatsiyasi muvaffaqiyatsiz");
        }

        const { user: tgUser } = parsed;
        const telegramId = String(tgUser.id);

        // findOrCreate pattern
        let user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { subscription: true },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    telegramId,
                    username: tgUser.username,
                    firstName: tgUser.first_name,
                    subscription: { create: { plan: 'FREE' } },
                },
                include: { subscription: true },
            });
            this.logger.log(`Yangi foydalanuvchi yaratildi: ${telegramId}`);
        }

        const accessToken = this.generateToken(user.id, user.telegramId);

        return {
            success: true,
            accessToken,
            user,
        };
    }

    /**
     * Development/test rejimi uchun — Telegram'siz to'g'ridan-to'g'ri login
     * (Faqat NODE_ENV=development bo'lganda ishlatiladi!)
     */
    async loginDevMode(telegramId: string) {
        if (this.configService.get('NODE_ENV') === 'production') {
            throw new UnauthorizedException("Dev login production'da o'chirilgan");
        }

        let user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { subscription: true },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    telegramId,
                    username: `dev_${telegramId}`,
                    firstName: 'Dev User',
                    subscription: { create: { plan: 'FREE' } },
                },
                include: { subscription: true },
            });
        }

        const accessToken = this.generateToken(user.id, user.telegramId);

        return { success: true, accessToken, user };
    }

    private generateToken(userId: number, telegramId: string): string {
        return this.jwtService.sign({
            sub: userId,
            telegramId,
        });
    }
}