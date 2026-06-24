// src/ai/ai.controller.ts

import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

// ─── DTO ───────────────────────────────────────
class GenerateFromTextDto {
    @IsString()
    @IsNotEmpty({ message: 'Matn bo\'sh bo\'lishi mumkin emas' })
    text: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(30)
    maxWords?: number;
}

class TranslateWordDto {
    @IsString()
    @IsNotEmpty({ message: 'So\'z bo\'sh bo\'lishi mumkin emas' })
    word: string;
}

// ─── CONTROLLER ────────────────────────────────
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * POST /ai/generate-from-text
     * Body: { "text": "...", "maxWords": 15 }
     */
    @Post('generate-from-text')
    async generateFromText(@Body() body: { text: string; maxWords?: number; language?: string }) {
        const flashcards = await this.aiService.generateFlashcardsFromText(
            body.text,
            body.maxWords ?? 15,
            body.language ?? 'english',  // ← QO'SHILDI
        );
        return { flashcards };
    }

    /**
     * POST /ai/generate-from-image
     * Form-data: image (file)
     */
    @Post('generate-from-image')
    @UseInterceptors(FileInterceptor('image'))
    async generateFromImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('language') language = 'english',  // ← QO'SHILDI
    ) {
        const base64 = file.buffer.toString('base64');
        const flashcards = await this.aiService.generateFlashcardsFromImage(
            base64,
            file.mimetype,
            15,
            language,  // ← QO'SHILDI
        );
        return { flashcards };
    }

    /**
     * POST /ai/translate-word
     * Body: { "word": "apple" }
     */
    @Post('translate-word')
    async translateWord(@Body() dto: TranslateWordDto) {
        const flashcard = await this.aiService.translateSingleWord(dto.word);
        return {
            success: true,
            flashcard,
        };
    }
}