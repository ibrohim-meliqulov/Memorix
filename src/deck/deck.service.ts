// src/deck/deck.service.ts

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';
import { SubscriptionHelper } from '../subscription/subscription.helper';

@Injectable()
export class DeckService {
    constructor(
        private prisma: PrismaService,
        private subscriptionHelper: SubscriptionHelper,
    ) { }

    async create(dto: CreateDeckDto) {
        await this.checkPlanLimit(dto.userId);

        return this.prisma.deck.create({
            data: {
                title: dto.title || "Yangi to'plam",
                description: dto.description,
                userId: dto.userId,
            },
        });
    }

    async findAllByUser(userId: number) {
        return this.prisma.deck.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { flashcards: true } },
            },
        });
    }

    async findOne(id: number) {
        const deck = await this.prisma.deck.findUnique({
            where: { id },
            include: {
                flashcards: { orderBy: { createdAt: 'asc' } },
                _count: { select: { flashcards: true } },
            },
        });

        if (!deck) {
            throw new NotFoundException(`Deck (ID: ${id}) topilmadi`);
        }

        return deck;
    }

    async update(id: number, userId: number, dto: UpdateDeckDto) {
        await this.checkOwnership(id, userId);
        return this.prisma.deck.update({ where: { id }, data: dto });
    }

    async remove(id: number, userId: number) {
        await this.checkOwnership(id, userId);
        await this.prisma.deck.delete({ where: { id } });
        return { success: true, message: "Deck o'chirildi" };
    }

    // ─── PRIVATE ───

    private async checkPlanLimit(userId: number) {
        // getActiveSubscription muddati tugagan bo'lsa avtomatik FREE'ga qaytaradi
        const sub = await this.subscriptionHelper.getActiveSubscription(userId);
        const plan = sub.plan;

        const deckLimits: Record<string, number> = {
            FREE: 3,
            STARTER: 10,
            PRO: Infinity,
            B2B: Infinity,
        };

        const limit = deckLimits[plan] ?? 3;

        if (limit !== Infinity) {
            const deckCount = await this.prisma.deck.count({ where: { userId } });
            if (deckCount >= limit) {
                const upgrade = plan === 'FREE' ? 'Starter yoki Premium' : 'Premium';
                throw new BadRequestException(
                    `${plan} rejada ko'pi bilan ${limit} ta to'plam bo'lishi mumkin. ${upgrade} ga o'ting!`
                );
            }
        }
    }

    private async checkOwnership(deckId: number, userId: number) {
        const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
        if (!deck) throw new NotFoundException(`Deck (ID: ${deckId}) topilmadi`);
        if (deck.userId !== userId) throw new ForbiddenException('Bu deck sizga tegishli emas');
        return deck;
    }
}