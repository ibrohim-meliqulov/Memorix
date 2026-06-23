// src/user/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    /**
     * Telegram orqali kirganda chaqiriladi:
     * - Agar user mavjud bo'lsa -> qaytaradi
     * - Mavjud bo'lmasa -> yangi yaratadi (FREE subscription bilan)
     * Bu "findOrCreate" pattern - Telegram Mini App uchun ideal
     */
    async findOrCreate(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { telegramId: dto.telegramId },
        });

        if (existing) {
            return existing;
        }

        return this.prisma.user.create({
            data: {
                telegramId: dto.telegramId,
                username: dto.username,
                firstName: dto.firstName,
                subscription: {
                    create: { plan: 'FREE' },
                },
            },
            include: { subscription: true },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { subscription: true },
        });

        if (!user) {
            throw new NotFoundException(`User (ID: ${id}) topilmadi`);
        }

        return user;
    }

    async findByTelegramId(telegramId: string) {
        const user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { subscription: true },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id);

        return this.prisma.user.update({
            where: { id },
            data: dto,
        });
    }

    /**
     * Foydalanuvchi statistikasi:
     * - Nechta deck yaratgan
     * - Nechta flashcard bor
     * - Subscription holati
     */
    async getStats(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                decks: { include: { flashcards: true } },
                subscription: true,
                sessions: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User (ID: ${userId}) topilmadi`);
        }

        const decks = user.decks as Array<{ flashcards: Array<any> }>;
        const sessions = user.sessions as Array<{ cardsStudied: number; studiedAt: Date }>;

        const totalDecks = decks.length;
        const totalFlashcards = decks.reduce((sum, d) => sum + d.flashcards.length, 0);
        const totalStudied = sessions.reduce((sum, s) => sum + s.cardsStudied, 0);
        const plan = user.subscription?.plan ?? 'FREE';

        // Streak hisoblash
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        for (let i = 0; i < 30; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            const hasSession = sessions.some(s => {
                const d = new Date(s.studiedAt);
                return d >= day && d < nextDay;
            });
            if (hasSession) streak++;
            else if (i > 0) break;
        }

        // Haftalik (Du-Ya)
        const weekly = Array(7).fill(0);
        sessions.forEach(s => {
            const d = new Date(s.studiedAt);
            const dayOfWeek = d.getDay();
            const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const copy = new Date(d);
            copy.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - copy.getTime()) / 86400000);
            if (diffDays < 7) weekly[idx] += s.cardsStudied;
        });

        return { totalDecks, totalFlashcards, totalStudied, streak, weekly, plan };
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: "Foydalanuvchi o'chirildi" };
    }
}