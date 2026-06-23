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
    async getStats(id: number) {
        const user = await this.findOne(id);

        const deckCount = await this.prisma.deck.count({
            where: { userId: id },
        });

        const flashcardCount = await this.prisma.flashcard.count({
            where: { deck: { userId: id } },
        });

        // Jami o'rganilgan so'zlar
        const sessions = await this.prisma.studySession.findMany({
            where: { userId: id },
            orderBy: { studiedAt: 'desc' },
        });

        const totalStudied = sessions.reduce((sum, s) => sum + s.cardsStudied, 0);

        // Streak hisoblash
        const streak = this.calcStreak(sessions.map(s => s.studiedAt));

        // Haftalik faollik (oxirgi 7 kun)
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 6);

        const weekly = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekAgo);
            d.setDate(weekAgo.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const count = sessions
                .filter(s => s.studiedAt.toISOString().split('T')[0] === dateStr)
                .reduce((sum, s) => sum + s.cardsStudied, 0);
            return { date: dateStr, count };
        });

        return {
            userId: id,
            firstName: user.firstName,
            plan: user.subscription?.plan ?? 'FREE',
            totalDecks: deckCount,
            totalFlashcards: flashcardCount,
            totalStudied,
            streak,
            weekly,
            memberSince: user.createdAt,
        };
    }

    private calcStreak(dates: Date[]): number {
        if (dates.length === 0) return 0;
        const unique = [...new Set(dates.map(d => d.toISOString().split('T')[0]))].sort().reverse();
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        for (let i = 0; i < unique.length; i++) {
            const expected = new Date();
            expected.setDate(expected.getDate() - i);
            if (unique[i] === expected.toISOString().split('T')[0]) {
                streak++;
            } else break;
        }
        return streak;
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: "Foydalanuvchi o'chirildi" };
    }
}