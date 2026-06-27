// src/user/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'B2B';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOrCreate(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { telegramId: dto.telegramId },
        });
        if (existing) return existing;

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
        if (!user) throw new NotFoundException(`User (ID: ${id}) topilmadi`);
        return user;
    }

    async findByTelegramId(telegramId: string) {
        const user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { subscription: true },
        });
        if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id);
        return this.prisma.user.update({ where: { id }, data: dto });
    }

    async getStats(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                decks: { include: { flashcards: true } },
                subscription: true,
                sessions: true,
            },
        });

        if (!user) throw new NotFoundException(`User (ID: ${userId}) topilmadi`);

        const decks = user.decks as any[];
        const sessions = user.sessions as any[];
        const plan = (user.subscription?.plan ?? 'FREE') as string;

        const totalDecks = decks.length;
        const totalFlashcards = decks.reduce((sum: number, d: any) => sum + d.flashcards.length, 0);
        const totalStudied = sessions.reduce((sum: number, s: any) => sum + s.cardsStudied, 0);

        const planLimits: Record<string, { decks: number; cards: number }> = {
            FREE: { decks: 3, cards: 30 },
            STARTER: { decks: 10, cards: 100 },
            PRO: { decks: Infinity, cards: Infinity },
            B2B: { decks: Infinity, cards: Infinity },
        };
        const limits = planLimits[plan] ?? planLimits['FREE'];

        // Streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        for (let i = 0; i < 30; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            const hasSession = sessions.some((s: any) => {
                const d = new Date(s.studiedAt);
                return d >= day && d < nextDay;
            });
            if (hasSession) streak++;
            else if (i > 0) break;
        }

        // Haftalik
        const weekly = Array(7).fill(0);
        sessions.forEach((s: any) => {
            const d = new Date(s.studiedAt);
            const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
            const copy = new Date(d);
            copy.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - copy.getTime()) / 86400000);
            if (diffDays < 7) weekly[idx] += s.cardsStudied;
        });

        return { totalDecks, totalFlashcards, totalStudied, streak, weekly, plan, limits };
    }
    async updatePlan(userId: number, plan: PlanType) {
        return this.prisma.subscription.upsert({
            where: { userId },
            update: { plan: plan as any },
            create: { userId, plan: plan as any },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: "Foydalanuvchi o'chirildi" };
    }


    async findOrCreateByGoogle(dto: {
        googleId: string;
        email: string;
        firstName: string;
        username: string;
    }) {
        // Email orqali mavjud userni topamiz
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: dto.googleId },
                    { email: dto.email }
                ]
            },
            include: { subscription: true },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    googleId: dto.googleId,
                    email: dto.email,
                    firstName: dto.firstName,
                    username: dto.username,
                    telegramId: `google_${dto.googleId}`,
                    subscription: { create: { plan: 'FREE' } },
                },
                include: { subscription: true },
            });
        }

        return user;
    }
}