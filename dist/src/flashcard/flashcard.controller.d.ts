import { FlashcardService } from './flashcard.service';
import { CreateFlashcardDto, UpdateFlashcardDto, BulkCreateFlashcardDto } from './dto/flashcard.dto';
export declare class FlashcardController {
    private readonly flashcardService;
    constructor(flashcardService: FlashcardService);
    create(dto: CreateFlashcardDto): Promise<{
        id: number;
        createdAt: Date;
        frontText: string;
        backText: string;
        example: string | null;
        imageUrl: string | null;
        deckId: number;
    }>;
    bulkCreate(dto: BulkCreateFlashcardDto): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    findAllByDeck(deckId: number): Promise<{
        id: number;
        createdAt: Date;
        frontText: string;
        backText: string;
        example: string | null;
        imageUrl: string | null;
        deckId: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        frontText: string;
        backText: string;
        example: string | null;
        imageUrl: string | null;
        deckId: number;
    }>;
    update(id: number, dto: UpdateFlashcardDto): Promise<{
        id: number;
        createdAt: Date;
        frontText: string;
        backText: string;
        example: string | null;
        imageUrl: string | null;
        deckId: number;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
