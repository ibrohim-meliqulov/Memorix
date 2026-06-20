import { ConfigService } from '@nestjs/config';
export interface GeneratedFlashcard {
    frontText: string;
    backText: string;
    example: string;
}
export declare class AiService {
    private configService;
    private readonly logger;
    private readonly genAI;
    private readonly modelName;
    constructor(configService: ConfigService);
    generateFlashcardsFromText(text: string, maxWords?: number): Promise<GeneratedFlashcard[]>;
    generateFlashcardsFromImage(base64Image: string, mimeType: string, maxWords?: number): Promise<GeneratedFlashcard[]>;
    translateSingleWord(word: string): Promise<GeneratedFlashcard>;
    private buildTextPrompt;
    private buildImagePrompt;
    private parseFlashcardResponse;
}
