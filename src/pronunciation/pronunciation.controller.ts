// src/pronunciation/pronunciation.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PronunciationService } from './pronunciation.service';

@Controller('pronunciation')
@UseGuards(JwtAuthGuard)
export class PronunciationController {
    constructor(private readonly pronunciationService: PronunciationService) { }

    // GET /pronunciation?text=hello&lang=english
    @Get()
    async getAudio(@Query('text') text: string, @Query('lang') lang: string) {
        const audioUrl = await this.pronunciationService.getAudioUrl(text, lang);
        return { audioUrl };
    }
}