// src/ai/ai.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface GeneratedFlashcard {
    frontText: string;
    backText: string;
    example: string;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly client: OpenAI;
    private readonly modelName = 'grok-3-mini';

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GROK_API_KEY');
        if (!apiKey) {
            throw new Error('GROK_API_KEY .env faylda topilmadi!');
        }
        this.client = new OpenAI({
            apiKey,
            baseURL: 'https://api.x.ai/v1',
        });
    }

    private readonly langMap: Record<string, { from: string; to: string; example: string }> = {
        english: { from: 'inglizcha', to: "o'zbekcha", example: 'inglizcha' },
        russian: { from: 'ruscha', to: "o'zbekcha", example: 'ruscha' },
        korean: { from: 'koreycha', to: "o'zbekcha", example: 'koreycha' },
    };

    async generateFlashcardsFromText(
        text: string,
        maxWords = 15,
        language = 'english',
    ): Promise<GeneratedFlashcard[]> {
        if (!text || text.trim().length === 0) {
            throw new BadRequestException("Matn bo'sh bo'lishi mumkin emas");
        }

        const lang = this.langMap[language] ?? this.langMap['english'];
        const prompt = this.buildTextPrompt(text, maxWords, lang);

        try {
            const response = await this.client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
            });
            const raw = response.choices[0].message.content || '[]';
            return this.parseFlashcardResponse(raw);
        } catch (error: any) {
            this.logger.error('Grok API xatosi (text):', error.message);
            if (error.status === 429) {
                throw new BadRequestException("AI hozir band. Biroz kutib qayta urinib ko'ring.");
            }
            throw new BadRequestException("AI orqali so'z ajratishda xatolik yuz berdi.");
        }
    }

    async generateFlashcardsFromImage(
        base64Image: string,
        mimeType: string,
        maxWords = 15,
        language = 'english',
    ): Promise<GeneratedFlashcard[]> {
        const lang = this.langMap[language] ?? this.langMap['english'];
        const prompt = this.buildImagePrompt(maxWords, lang);

        try {
            const response = await this.client.chat.completions.create({
                model: 'grok-2-vision',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ],
                }],
                max_tokens: 2000,
            });
            const raw = response.choices[0].message.content || '[]';
            return this.parseFlashcardResponse(raw);
        } catch (error: any) {
            this.logger.error('Grok vision xatosi:', error.message);
            if (error.status === 429) {
                throw new BadRequestException("AI hozir band. Biroz kutib qayta urinib ko'ring.");
            }
            throw new BadRequestException('Rasmni tahlil qilishda xatolik yuz berdi.');
        }
    }

    async translateSingleWord(word: string, language = 'english'): Promise<GeneratedFlashcard> {
        const lang = this.langMap[language] ?? this.langMap['english'];
        const prompt = `"${word}" ${lang.from} so'zini ${lang.to} ga tarjima qil va ${lang.example} tilida misol jumla yoz.
FAQAT JSON formatda javob ber:
{"frontText":"${word}","backText":"tarjima","example":"misol jumla"}`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            });
            const raw = response.choices[0].message.content || '{}';
            const parsed = this.parseFlashcardResponse(raw);
            if (parsed.length === 0) throw new Error('Tarjima topilmadi');
            return parsed[0];
        } catch (error: any) {
            this.logger.error('Grok API xatosi (single word):', error.message);
            throw new BadRequestException("So'zni tarjima qilishda xatolik yuz berdi.");
        }
    }

    // ─── PRIVATE HELPERS ───

    private buildTextPrompt(
        text: string,
        maxWords: number,
        lang: { from: string; to: string; example: string },
    ): string {
        return `Sen til o'rganish yordamchisisan. Quyidagi matndan eng muhim ${lang.from} so'zlarni ajratib ol (ko'pi bilan ${maxWords} ta), har biriga ${lang.to} tarjima va ${lang.example} tilida misol jumla yoz.

Qoidalar:
- Faqat asosiy so'zlarni tanla (takrorlanmasin)
- Juda oddiy so'zlarni o'tkazib yubor
- Tarjima aniq va tabiiy o'zbek tilida bo'lsin
- Misol jumla ${lang.example} tilida bo'lsin

Matn:
"""
${text}
"""

FAQAT shu JSON array formatda javob ber, hech qanday markdown yoki izoh qo'shma:
[{"frontText":"so'z","backText":"tarjima","example":"misol"}]`;
    }

    private buildImagePrompt(
        maxWords: number,
        lang: { from: string; to: string; example: string },
    ): string {
        return `Sen til o'rganish yordamchisisan. Bu rasmda ${lang.from} matn yoki so'zlar bor.

Vazifang:
1. Rasmdagi barcha ${lang.from} so'z/matnni o'qi
2. Eng muhim so'zlarni tanla (ko'pi bilan ${maxWords} ta)
3. Har biriga ${lang.to} tarjima va ${lang.example} tilida misol jumla yoz

Agar rasmda ${lang.from} matn bo'lmasa: []

FAQAT JSON array: [{"frontText":"so'z","backText":"tarjima","example":"misol"}]`;
    }

    private parseFlashcardResponse(responseText: string): GeneratedFlashcard[] {
        try {
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
            cleaned = cleaned.replace(/^```\s*/, '');

            const parsed = JSON.parse(cleaned);
            const array = Array.isArray(parsed) ? parsed : [parsed];

            return array
                .filter(item => item && typeof item.frontText === 'string' && typeof item.backText === 'string')
                .map(item => ({
                    frontText: item.frontText.trim(),
                    backText: item.backText.trim(),
                    example: item.example?.trim() || '',
                }));
        } catch (error) {
            this.logger.error('JSON parse xatosi:', error, 'Raw:', responseText);
            throw new BadRequestException('AI javobini qayta ishlashda xatolik yuz berdi.');
        }
    }
}