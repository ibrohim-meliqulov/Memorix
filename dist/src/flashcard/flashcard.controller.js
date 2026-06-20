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
exports.FlashcardController = void 0;
const common_1 = require("@nestjs/common");
const flashcard_service_1 = require("./flashcard.service");
const flashcard_dto_1 = require("./dto/flashcard.dto");
let FlashcardController = class FlashcardController {
    flashcardService;
    constructor(flashcardService) {
        this.flashcardService = flashcardService;
    }
    create(dto) {
        return this.flashcardService.create(dto);
    }
    bulkCreate(dto) {
        return this.flashcardService.bulkCreate(dto);
    }
    findAllByDeck(deckId) {
        return this.flashcardService.findAllByDeck(deckId);
    }
    findOne(id) {
        return this.flashcardService.findOne(id);
    }
    update(id, dto) {
        return this.flashcardService.update(id, dto);
    }
    remove(id) {
        return this.flashcardService.remove(id);
    }
};
exports.FlashcardController = FlashcardController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [flashcard_dto_1.CreateFlashcardDto]),
    __metadata("design:returntype", void 0)
], FlashcardController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [flashcard_dto_1.BulkCreateFlashcardDto]),
    __metadata("design:returntype", void 0)
], FlashcardController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('deckId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FlashcardController.prototype, "findAllByDeck", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FlashcardController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, flashcard_dto_1.UpdateFlashcardDto]),
    __metadata("design:returntype", void 0)
], FlashcardController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FlashcardController.prototype, "remove", null);
exports.FlashcardController = FlashcardController = __decorate([
    (0, common_1.Controller)('flashcards'),
    __metadata("design:paramtypes", [flashcard_service_1.FlashcardService])
], FlashcardController);
//# sourceMappingURL=flashcard.controller.js.map