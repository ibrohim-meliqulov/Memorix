export declare class CreateFlashcardDto {
    deckId: number;
    frontText: string;
    backText: string;
    example?: string;
    imageUrl?: string;
}
export declare class UpdateFlashcardDto {
    frontText?: string;
    backText?: string;
    example?: string;
    imageUrl?: string;
}
declare class FlashcardItemDto {
    frontText: string;
    backText: string;
    example?: string;
}
export declare class BulkCreateFlashcardDto {
    deckId: number;
    flashcards: FlashcardItemDto[];
}
export {};
