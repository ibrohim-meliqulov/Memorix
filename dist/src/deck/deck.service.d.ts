import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';
export declare class DeckService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDeckDto): Promise<{
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    findAllByUser(userId: number): Promise<({
        _count: {
            flashcards: number;
        };
    } & {
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    })[]>;
    findOne(id: number): Promise<{
        flashcards: {
            createdAt: Date;
            id: number;
            frontText: string;
            backText: string;
            example: string | null;
            imageUrl: string | null;
            deckId: number;
        }[];
        _count: {
            flashcards: number;
        };
    } & {
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    update(id: number, userId: number, dto: UpdateDeckDto): Promise<{
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    remove(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private checkOwnership;
}
