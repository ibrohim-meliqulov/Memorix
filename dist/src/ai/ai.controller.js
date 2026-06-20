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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const ai_service_1 = require("./ai.service");
const class_validator_1 = require("class-validator");
class GenerateFromTextDto {
    text;
    maxWords;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Matn bo\'sh bo\'lishi mumkin emas' }),
    __metadata("design:type", String)
], GenerateFromTextDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], GenerateFromTextDto.prototype, "maxWords", void 0);
class TranslateWordDto {
    word;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'So\'z bo\'sh bo\'lishi mumkin emas' }),
    __metadata("design:type", String)
], TranslateWordDto.prototype, "word", void 0);
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async generateFromText(dto) {
        const flashcards = await this.aiService.generateFlashcardsFromText(dto.text, dto.maxWords);
        return {
            success: true,
            count: flashcards.length,
            flashcards,
        };
    }
    async generateFromImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Rasm fayli yuborilmadi');
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Faqat JPEG, PNG yoki WEBP formatdagi rasm qabul qilinadi');
        }
        const base64Image = file.buffer.toString('base64');
        const flashcards = await this.aiService.generateFlashcardsFromImage(base64Image, file.mimetype);
        return {
            success: true,
            count: flashcards.length,
            flashcards,
        };
    }
    async translateWord(dto) {
        const flashcard = await this.aiService.translateSingleWord(dto.word);
        return {
            success: true,
            flashcard,
        };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate-from-text'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateFromTextDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateFromText", null);
__decorate([
    (0, common_1.Post)('generate-from-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateFromImage", null);
__decorate([
    (0, common_1.Post)('translate-word'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TranslateWordDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "translateWord", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map