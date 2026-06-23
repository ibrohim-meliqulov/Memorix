// src/ai/ai.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratedFlashcard {
    frontText: string;   // Inglizcha so'z
    backText: string;    // O'zbekcha tarjima
    example: string;     // Misol jumla (inglizcha)
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

    /**
     * Matndan inglizcha so'zlarni ajratib, o'zbekcha tarjima + misol bilan qaytaradi
     */
    async generateFlashcardsFromText(
        text: string,
        maxWords = 15,
    ): Promise<GeneratedFlashcard[]> {
        if (!text || text.trim().length === 0) {
            throw new BadRequestException('Matn bo\'sh bo\'lishi mumkin emas');
        }

        const prompt = this.buildTextPrompt(text, maxWords);

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            return this.parseFlashcardResponse(responseText);
        } catch (error: any) {
            this.logger.error('Gemini API xatosi (text):', error.message);
            if (error.status === 429 || error.message?.includes('429')) {
                throw new BadRequestException(
                    'AI hozir band. Biroz kutib qayta urinib ko\'ring.',
                );
            }
            throw new BadRequestException(
                'AI orqali so\'z ajratishda xatolik yuz berdi.',
            );
        }
    }

    /**
     * Rasmdan (base64) inglizcha so'zlarni aniqlab, tarjima qiladi
     */
    async generateFlashcardsFromImage(
        base64Image: string,
        mimeType: string,
        maxWords = 15,
    ): Promise<GeneratedFlashcard[]> {
        const prompt = this.buildImagePrompt(maxWords);

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType, // image/jpeg, image/png
                    },
                },
            ]);

            const responseText = result.response.text();
            return this.parseFlashcardResponse(responseText);
        } catch (error) {
            this.logger.error('Gemini API xatosi (image):', error);
            throw new BadRequestException(
                'Rasmni tahlil qilishda xatolik yuz berdi. Qayta urinib ko\'ring.',
            );
        }
    }

    /**
     * Bitta so'zni tezkor tarjima qilish (qo'lda qo'shilganda)
     */
    async translateSingleWord(word: string): Promise<GeneratedFlashcard> {
        const prompt = `
Quyidagi inglizcha so'zni o'zbekchaga tarjima qil va misol jumla yoz.
So'z: "${word}"

FAQAT shu JSON formatda javob ber, boshqa hech narsa yozma:
{
  "frontText": "${word}",
  "backText": "o'zbekcha tarjima",
  "example": "Inglizcha misol jumla shu so'z bilan"
}
`;

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = this.parseFlashcardResponse(responseText);

            if (parsed.length === 0) {
                throw new Error('Tarjima topilmadi');
            }
            return parsed[0];
        } catch (error) {
            this.logger.error('Gemini API xatosi (single word):', error);
            throw new BadRequestException('So\'zni tarjima qilishda xatolik yuz berdi.');
        }
    }

    // ─────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────

    private buildTextPrompt(text: string, maxWords: number): string {
        return `
Sen til o'rganish yordamchisisan. Quyidagi matndan eng muhim/foydali inglizcha so'zlarni ajratib ol (ko'pi bilan ${maxWords} ta), har biriga o'zbekcha tarjima va misol jumla yoz.

Qoidalar:
- Faqat asosiy so'zlarni tanla (so'zlar takrorlanmasin)
- "the", "a", "is" kabi oddiy so'zlarni o'tkazib yubor
- Tarjima aniq va tabiiy o'zbek tilida bo'lsin
- Misol jumla original matndan yoki o'xshash kontekstdan bo'lsin

Matn:
"""
${text}
"""

FAQAT shu JSON array formatda javob ber, boshqa hech qanday matn, izoh yoki markdown belgisi (\`\`\`) qo'shma:
[
  {
    "frontText": "inglizcha so'z",
    "backText": "o'zbekcha tarjima",
    "example": "Inglizcha misol jumla"
  }
]
`;
    }

    private buildImagePrompt(maxWords: number): string {
        return `
Sen til o'rganish yordamchisisan. Bu rasmda inglizcha matn yoki so'zlar bor. 

Vazifang:
1. Rasmdagi barcha inglizcha so'z/matnni o'qi (OCR)
2. Eng muhim/foydali so'zlarni tanla (ko'pi bilan ${maxWords} ta)
3. Har biriga o'zbekcha tarjima va misol jumla yoz

Qoidalar:
- Agar rasmda alohida so'zlar ro'yxati bo'lsa (masalan lug'at sahifasi), barchasini ol
- Agar rasmda gap/matn bo'lsa, undagi muhim so'zlarni ajrat
- "the", "a", "is" kabi oddiy so'zlarni o'tkazib yubor
- Agar rasmda inglizcha matn umuman bo'lmasa, bo'sh array qaytar: []

FAQAT shu JSON array formatda javob ber, boshqa hech qanday matn, izoh yoki markdown belgisi qo'shma:
[
  {
    "frontText": "inglizcha so'z",
    "backText": "o'zbekcha tarjima",
    "example": "Inglizcha misol jumla"
  }
]
`;
    }

    /**
     * Gemini javobidan JSON ni xavfsiz ajratib oladi
     * (Gemini ba'zan ```json ... ``` bilan o'rab yuborishi mumkin)
     */
    private parseFlashcardResponse(responseText: string): GeneratedFlashcard[] {
        try {
            // Markdown code block bo'lsa tozalash
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
            cleaned = cleaned.replace(/^```\s*/, '');

            const parsed = JSON.parse(cleaned);

            // Bitta obyekt qaytgan bo'lsa, arrayga o'rab qo'yamiz
            const array = Array.isArray(parsed) ? parsed : [parsed];

            // Validatsiya — kerakli fieldlar borligini tekshirish
            return array
                .filter(
                    (item) =>
                        item &&
                        typeof item.frontText === 'string' &&
                        typeof item.backText === 'string',
                )
                .map((item) => ({
                    frontText: item.frontText.trim(),
                    backText: item.backText.trim(),
                    example: item.example?.trim() || '',
                }));
        } catch (error) {
            this.logger.error('JSON parse xatosi:', error, 'Raw response:', responseText);
            throw new BadRequestException(
                'AI javobini qayta ishlashda xatolik yuz berdi.',
            );
        }
    }
}