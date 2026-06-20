"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    configService;
    logger = new common_1.Logger(AiService_1.name);
    genAI;
    modelName = 'gemini-2.5-flash';
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY .env faylda topilmadi!');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateFlashcardsFromText(text, maxWords = 15) {
        if (!text || text.trim().length === 0) {
            throw new common_1.BadRequestException('Matn bo\'sh bo\'lishi mumkin emas');
        }
        const prompt = this.buildTextPrompt(text, maxWords);
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return this.parseFlashcardResponse(responseText);
        }
        catch (error) {
            this.logger.error('Gemini API xatosi (text):', error);
            throw new common_1.BadRequestException('AI orqali so\'z ajratishda xatolik yuz berdi. Qayta urinib ko\'ring.');
        }
    }
    async generateFlashcardsFromImage(base64Image, mimeType, maxWords = 15) {
        const prompt = this.buildImagePrompt(maxWords);
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
            ]);
            const responseText = result.response.text();
            return this.parseFlashcardResponse(responseText);
        }
        catch (error) {
            this.logger.error('Gemini API xatosi (image):', error);
            throw new common_1.BadRequestException('Rasmni tahlil qilishda xatolik yuz berdi. Qayta urinib ko\'ring.');
        }
    }
    async translateSingleWord(word) {
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
        }
        catch (error) {
            this.logger.error('Gemini API xatosi (single word):', error);
            throw new common_1.BadRequestException('So\'zni tarjima qilishda xatolik yuz berdi.');
        }
    }
    buildTextPrompt(text, maxWords) {
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
    buildImagePrompt(maxWords) {
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
    parseFlashcardResponse(responseText) {
        try {
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
            cleaned = cleaned.replace(/^```\s*/, '');
            const parsed = JSON.parse(cleaned);
            const array = Array.isArray(parsed) ? parsed : [parsed];
            return array
                .filter((item) => item &&
                typeof item.frontText === 'string' &&
                typeof item.backText === 'string')
                .map((item) => ({
                frontText: item.frontText.trim(),
                backText: item.backText.trim(),
                example: item.example?.trim() || '',
            }));
        }
        catch (error) {
            this.logger.error('JSON parse xatosi:', error, 'Raw response:', responseText);
            throw new common_1.BadRequestException('AI javobini qayta ishlashda xatolik yuz berdi.');
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map