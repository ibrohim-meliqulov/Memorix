import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';
export declare class DeckService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDeckDto): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        updatedAt: Date;
        userId: number;
    }>;
    findAllByUser(userId: number): Promise<({
        _count: {
            flashcards: number;
        };
    } & {
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        updatedAt: Date;
        userId: number;
    })[]>;
    findOne(id: number): Promise<{
        flashcards: {
            id: number;
            createdAt: Date;
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
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        updatedAt: Date;
        userId: number;
    }>;
    update(id: number, userId: number, dto: UpdateDeckDto): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        updatedAt: Date;
        userId: number;
    }>;
    remove(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private checkOwnership;
}
