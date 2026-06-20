import { AiService } from './ai.service';
declare class GenerateFromTextDto {
    text: string;
    maxWords?: number;
}
declare class TranslateWordDto {
    word: string;
}
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generateFromText(dto: GenerateFromTextDto): Promise<{
        success: boolean;
        count: number;
        flashcards: import("./ai.service").GeneratedFlashcard[];
    }>;
    generateFromImage(file: Express.Multer.File): Promise<{
        success: boolean;
        count: number;
        flashcards: import("./ai.service").GeneratedFlashcard[];
    }>;
    translateWord(dto: TranslateWordDto): Promise<{
        success: boolean;
        flashcard: import("./ai.service").GeneratedFlashcard;
    }>;
}
export {};
