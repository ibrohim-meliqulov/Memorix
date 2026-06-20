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
    async generateFromText(@Body() dto: GenerateFromTextDto) {
        const flashcards = await this.aiService.generateFlashcardsFromText(
            dto.text,
            dto.maxWords,
        );
        return {
            success: true,
            count: flashcards.length,
            flashcards,
        };
    }

    /**
     * POST /ai/generate-from-image
     * Form-data: image (file)
     */
    @Post('generate-from-image')
    @UseInterceptors(FileInterceptor('image'))
    async generateFromImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Rasm fayli yuborilmadi');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Faqat JPEG, PNG yoki WEBP formatdagi rasm qabul qilinadi',
            );
        }

        const base64Image = file.buffer.toString('base64');
        const flashcards = await this.aiService.generateFlashcardsFromImage(
            base64Image,
            file.mimetype,
        );

        return {
            success: true,
            count: flashcards.length,
            flashcards,
        };
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