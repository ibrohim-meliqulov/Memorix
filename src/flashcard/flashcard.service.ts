// src/flashcard/flashcard.service.ts

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateFlashcardDto,
    UpdateFlashcardDto,
    BulkCreateFlashcardDto,
} from './dto/flashcard.dto';
import { SubscriptionHelper } from '../subscription/subscription.helper';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FlashcardService {
    constructor(
        private prisma: PrismaService,
        private subscriptionHelper: SubscriptionHelper,
        private userService: UserService
    ) { }

    async create(dto: CreateFlashcardDto) {
        await this.checkDeckExists(dto.deckId);
        return this.prisma.flashcard.create({
            data: {
                deckId: dto.deckId,
                frontText: dto.frontText,
                backText: dto.backText,
                example: dto.example,
                imageUrl: dto.imageUrl,
            },
        });
    }

    async bulkCreate(dto: BulkCreateFlashcardDto) {
        const deck = await this.checkDeckExists(dto.deckId);
        await this.checkFlashcardLimit(deck.userId);

        const created = await this.prisma.flashcard.createMany({
            data: dto.flashcards.map((card) => ({
                deckId: dto.deckId,
                frontText: card.frontText,
                backText: card.backText,
                example: card.example,
            })),
        });

        return {
            success: true,
            count: created.count,
            message: `${created.count} ta flashcard saqlandi`,
        };
    }

    async findAllByDeck(deckId: number) {
        await this.checkDeckExists(deckId);
        return this.prisma.flashcard.findMany({
            where: { deckId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findOne(id: number) {
        const flashcard = await this.prisma.flashcard.findUnique({ where: { id } });
        if (!flashcard) throw new NotFoundException(`Flashcard (ID: ${id}) topilmadi`);
        return flashcard;
    }

    async update(id: number, dto: UpdateFlashcardDto) {
        await this.findOne(id);
        return this.prisma.flashcard.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.flashcard.delete({ where: { id } });
        return { success: true, message: "Flashcard o'chirildi" };
    }

    async saveSession(userId: number, cardsStudied: number) {
        const session = await this.prisma.studySession.create({
            data: { userId, cardsStudied },
        });

        // Har bir kartochka uchun 10 XP
        const xpEarned = cardsStudied * 10;
        await this.userService.addXp(userId, xpEarned);

        return { ...session, xpEarned };
    }

    // ─── PRIVATE ───

    private async checkDeckExists(deckId: number) {
        const deck = await this.prisma.deck.findUnique({
            where: { id: deckId },
            include: { user: true },
        });
        if (!deck) throw new NotFoundException(`Deck (ID: ${deckId}) topilmadi`);
        return deck;
    }

    private async checkFlashcardLimit(userId: number) {
        // getActiveSubscription muddati tugagan bo'lsa avtomatik FREE'ga qaytaradi
        const sub = await this.subscriptionHelper.getActiveSubscription(userId);
        const plan = sub.plan;

        const cardLimits: Record<string, number> = {
            FREE: 30,
            STARTER: 100,
            PRO: Infinity,
            B2B: Infinity,
        };

        const limit = cardLimits[plan] ?? 30;

        if (limit !== Infinity) {
            const total = await this.prisma.flashcard.count({
                where: { deck: { userId } },
            });
            if (total >= limit) {
                const upgrade = plan === 'FREE' ? 'Starter yoki Premium' : 'Premium';
                throw new BadRequestException(
                    `${plan} rejada ko'pi bilan ${limit} ta so'z bo'lishi mumkin. ${upgrade} ga o'ting!`
                );
            }
        }
    }
}