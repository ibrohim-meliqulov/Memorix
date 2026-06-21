import { DeckService } from './deck.service';
import { UpdateDeckDto } from './dto/deck.dto';
import type { CurrentUserData } from '../auth/current-user.decorator';
declare class CreateDeckBodyDto {
    title: string;
    description?: string;
}
export declare class DeckController {
    private readonly deckService;
    constructor(deckService: DeckService);
    create(user: CurrentUserData, dto: CreateDeckBodyDto): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        updatedAt: Date;
        userId: number;
    }>;
    findAllByUser(user: CurrentUserData): Promise<({
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
    update(id: number, user: CurrentUserData, dto: UpdateDeckDto): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        updatedAt: Date;
        userId: number;
    }>;
    remove(id: number, user: CurrentUserData): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
