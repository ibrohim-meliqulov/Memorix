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

        return {
            userId: id,
            firstName: user.firstName,
            plan: user.subscription?.plan ?? 'FREE',
            totalDecks: deckCount,
            totalFlashcards: flashcardCount,
            memberSince: user.createdAt,
        };
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: "Foydalanuvchi o'chirildi" };
    }
}