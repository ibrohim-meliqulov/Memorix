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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkCreateFlashcardDto = exports.UpdateFlashcardDto = exports.CreateFlashcardDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateFlashcardDto {
    deckId;
    frontText;
    backText;
    example;
    imageUrl;
}
exports.CreateFlashcardDto = CreateFlashcardDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateFlashcardDto.prototype, "deckId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFlashcardDto.prototype, "frontText", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFlashcardDto.prototype, "backText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlashcardDto.prototype, "example", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlashcardDto.prototype, "imageUrl", void 0);
class UpdateFlashcardDto {
    frontText;
    backText;
    example;
    imageUrl;
}
exports.UpdateFlashcardDto = UpdateFlashcardDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateFlashcardDto.prototype, "frontText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateFlashcardDto.prototype, "backText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFlashcardDto.prototype, "example", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFlashcardDto.prototype, "imageUrl", void 0);
class FlashcardItemDto {
    frontText;
    backText;
    example;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FlashcardItemDto.prototype, "frontText", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FlashcardItemDto.prototype, "backText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardItemDto.prototype, "example", void 0);
class BulkCreateFlashcardDto {
    deckId;
    flashcards;
}
exports.BulkCreateFlashcardDto = BulkCreateFlashcardDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BulkCreateFlashcardDto.prototype, "deckId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: "Kamida 1 ta flashcard bo'lishi kerak" }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FlashcardItemDto),
    __metadata("design:type", Array)
], BulkCreateFlashcardDto.prototype, "flashcards", void 0);
//# sourceMappingURL=flashcard.dto.js.map