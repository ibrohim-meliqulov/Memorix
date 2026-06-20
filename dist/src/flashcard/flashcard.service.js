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
exports.FlashcardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FlashcardService = class FlashcardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        await this.checkDeckExists(dto.deckId);
        return this.prisma.flashcard.create({
            data: {
                deckId: dto.deckId,
                frontText: dto.frontText,
                backText: dto.backText,
                example: dto.example,
                imageUrl: dto.imageUrl,
            },
        });
    }
    async bulkCreate(dto) {
        await this.checkDeckExists(dto.deckId);
        const created = await this.prisma.flashcard.createMany({
            data: dto.flashcards.map((card) => ({
                deckId: dto.deckId,
                frontText: card.frontText,
                backText: card.backText,
                example: card.example,
            })),
        });
        return {
            success: true,
            count: created.count,
            message: `${created.count} ta flashcard saqlandi`,
        };
    }
    async findAllByDeck(deckId) {
        await this.checkDeckExists(deckId);
        return this.prisma.flashcard.findMany({
            where: { deckId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const flashcard = await this.prisma.flashcard.findUnique({
            where: { id },
        });
        if (!flashcard) {
            throw new common_1.NotFoundException(`Flashcard (ID: ${id}) topilmadi`);
        }
        return flashcard;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.flashcard.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.flashcard.delete({ where: { id } });
        return { success: true, message: "Flashcard o'chirildi" };
    }
    async checkDeckExists(deckId) {
        const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
        if (!deck) {
            throw new common_1.NotFoundException(`Deck (ID: ${deckId}) topilmadi`);
        }
        return deck;
    }
};
exports.FlashcardService = FlashcardService;
exports.FlashcardService = FlashcardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlashcardService);
//# sourceMappingURL=flashcard.service.js.map