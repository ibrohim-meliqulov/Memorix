// src/deck/deck.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';

@Injectable()
export class DeckService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateDeckDto) {
        return this.prisma.deck.create({
            data: {
                title: dto.title,
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
                _count: {
                    select: { flashcards: true },
                },
            },
        });
    }

    async findOne(id: number) {
        const deck = await this.prisma.deck.findUnique({
            where: { id },
            include: {
                flashcards: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: { flashcards: true },
                },
            },
        });

        if (!deck) {
            throw new NotFoundException(`Deck (ID: ${id}) topilmadi`);
        }

        return deck;
    }

    async update(id: number, userId: number, dto: UpdateDeckDto) {
        await this.checkOwnership(id, userId);

        return this.prisma.deck.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number, userId: number) {
        await this.checkOwnership(id, userId);

        await this.prisma.deck.delete({ where: { id } });
        return { success: true, message: "Deck o'chirildi" };
    }

    /**
     * Deck shu userga tegishli ekanligini tekshiradi
     */
    private async checkOwnership(deckId: number, userId: number) {
        const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });

        if (!deck) {
            throw new NotFoundException(`Deck (ID: ${deckId}) topilmadi`);
        }

        if (deck.userId !== userId) {
            throw new ForbiddenException('Bu deck sizga tegishli emas');
        }

        return deck;
    }
}