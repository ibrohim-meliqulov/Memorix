// src/ai/ai.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratedFlashcard {
    frontText: string;
    backText: string;
    example: string;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly genAI: GoogleGenerativeAI;
    private readonly modelName = 'gemini-2.0-flash';

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY .env faylda topilmadi!');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
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
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            return this.parseFlashcardResponse(result.response.text());
        } catch (error: any) {
            this.logger.error('Gemini API xatosi (text):', error.message);
            if (error.status === 429 || error.message?.includes('429')) {
                throw new BadRequestException('AI hozir band. Biroz kutib qayta urinib ko\'ring.');
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
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Image, mimeType } },
            ]);
            return this.parseFlashcardResponse(result.response.text());
        } catch (error: any) {
            this.logger.error('Gemini API xatosi (image):', error);
            if (error.status === 429 || error.message?.includes('429')) {
                throw new BadRequestException('AI hozir band. Biroz kutib qayta urinib ko\'ring.');
            }
            throw new BadRequestException('Rasmni tahlil qilishda xatolik yuz berdi.');
        }
    }

    async translateSingleWord(word: string, language = 'english'): Promise<GeneratedFlashcard> {
        const lang = this.langMap[language] ?? this.langMap['english'];
        const prompt = `
Quyidagi ${lang.from} so'zni ${lang.to} ga tarjima qil va ${lang.example} tilida misol jumla yoz.
So'z: "${word}"

FAQAT shu JSON formatda javob ber, boshqa hech narsa yozma:
{
  "frontText": "${word}",
  "backText": "${lang.to} tarjima",
  "example": "${lang.example} tilida misol jumla"
}
`;
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const parsed = this.parseFlashcardResponse(result.response.text());
            if (parsed.length === 0) throw new Error('Tarjima topilmadi');
            return parsed[0];
        } catch (error) {
            this.logger.error('Gemini API xatosi (single word):', error);
            throw new BadRequestException("So'zni tarjima qilishda xatolik yuz berdi.");
        }
    }

    // ─── PRIVATE HELPERS ───

    private buildTextPrompt(
        text: string,
        maxWords: number,
        lang: { from: string; to: string; example: string },
    ): string {
        return `
Sen til o'rganish yordamchisisan. Quyidagi matndan eng muhim ${lang.from} so'zlarni ajratib ol (ko'pi bilan ${maxWords} ta), har biriga ${lang.to} tarjima va ${lang.example} tilida misol jumla yoz.

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
[
  {
    "frontText": "${lang.from} so'z",
    "backText": "${lang.to} tarjima",
    "example": "${lang.example} tilida misol jumla"
  }
]
`;
    }

    private buildImagePrompt(
        maxWords: number,
        lang: { from: string; to: string; example: string },
    ): string {
        return `
Sen til o'rganish yordamchisisan. Bu rasmda ${lang.from} matn yoki so'zlar bor.

Vazifang:
1. Rasmdagi barcha ${lang.from} so'z/matnni o'qi
2. Eng muhim so'zlarni tanla (ko'pi bilan ${maxWords} ta)
3. Har biriga ${lang.to} tarjima va ${lang.example} tilida misol jumla yoz

Agar rasmda ${lang.from} matn umuman bo'lmasa, bo'sh array qaytar: []

FAQAT shu JSON array formatda javob ber, hech qanday markdown yoki izoh qo'shma:
[
  {
    "frontText": "${lang.from} so'z",
    "backText": "${lang.to} tarjima",
    "example": "${lang.example} tilida misol jumla"
  }
]
`;
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