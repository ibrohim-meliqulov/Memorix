// src/flashcard/flashcard.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateFlashcardDto,
    UpdateFlashcardDto,
    BulkCreateFlashcardDto,
} from './dto/flashcard.dto';

@Injectable()
export class FlashcardService {
    constructor(private prisma: PrismaService) { }

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

    /**
     * AI natijasidan kelgan bir nechta flashcardni birdaniga saqlaydi
     * Masalan: AI rasmdan 15 ta so'z ajratdi → hammasini bitta so'rovda DB ga yozadi
     */
    async bulkCreate(dto: BulkCreateFlashcardDto) {
        const deck = await this.checkDeckExists(dto.deckId);

        // Subscription tekshirish
        const sub = await this.prisma.subscription.findUnique({
            where: { userId: deck.userId },
        });
        const isPro = sub?.plan === 'PRO' || sub?.plan === 'B2B';

        if (!isPro) {
            const cardCount = await this.prisma.flashcard.count({
                where: { deck: { userId: deck.userId } },
            });
            if (cardCount >= 30) {
                throw new BadRequestException(
                    'FREE rejada maksimum 30 ta so\'z saqlash mumkin. PRO ga o\'ting!'
                );
            }
        }

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
        const flashcard = await this.prisma.flashcard.findUnique({
            where: { id },
        });

        if (!flashcard) {
            throw new NotFoundException(`Flashcard (ID: ${id}) topilmadi`);
        }

        return flashcard;
    }

    async update(id: number, dto: UpdateFlashcardDto) {
        await this.findOne(id); // mavjudligini tekshirish

        return this.prisma.flashcard.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        await this.prisma.flashcard.delete({ where: { id } });
        return { success: true, message: "Flashcard o'chirildi" };
    }

    private async checkDeckExists(deckId: number) {
        const deck = await this.prisma.deck.findUnique({
            where: { id: deckId },
            include: { user: true },
        });
        if (!deck) {
            throw new NotFoundException(`Deck (ID: ${deckId}) topilmadi`);
        }
        return deck;
    }
}