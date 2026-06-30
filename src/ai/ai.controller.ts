// src/ai/ai.controller.ts

import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { SubscriptionHelper } from '../subscription/subscription.helper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/current-user.decorator';
import { compressImageForAi } from './image-compress.helper';
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
// Diqqat: barcha AI endpointlar endi JwtAuthGuard talab qiladi —
// chunki kunlik limit aynan shu userga bog'lab hisoblanadi.
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly subscriptionHelper: SubscriptionHelper,
    ) { }

    /**
     * POST /ai/generate-from-text
     * Body: { "text": "...", "maxWords": 15 }
     */
    @Post('generate-from-text')
    async generateFromText(
        @CurrentUser() user: CurrentUserData,
        @Body() body: { text: string; maxWords?: number; language?: string },
    ) {
        await this.subscriptionHelper.checkAndIncrementAiUsage(user.userId);

        const flashcards = await this.aiService.generateFlashcardsFromText(
            body.text,
            body.maxWords ?? 15,
            body.language ?? 'english',
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
        @CurrentUser() user: CurrentUserData,
        @UploadedFile() file: Express.Multer.File,
        @Body('language') language = 'english',
    ) {
        await this.subscriptionHelper.checkAndIncrementAiUsage(user.userId);

        // Rasmni AI'ga yuborishdan oldin siqamiz — token/xarajatni kamaytiradi
        const { buffer, mimeType } = await compressImageForAi(file.buffer);
        const base64 = buffer.toString('base64');

        const flashcards = await this.aiService.generateFlashcardsFromImage(
            base64,
            mimeType,
            15,
            language,
        );
        return { flashcards };
    }

    /**
     * POST /ai/translate-word
     * Body: { "word": "apple" }
     */
    @Post('translate-word')
    async translateWord(
        @CurrentUser() user: CurrentUserData,
        @Body() dto: TranslateWordDto,
    ) {
        await this.subscriptionHelper.checkAndIncrementAiUsage(user.userId);

        const flashcard = await this.aiService.translateSingleWord(dto.word);
        return {
            success: true,
            flashcard,
        };
    }
}