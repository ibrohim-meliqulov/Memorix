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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeckService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DeckService = class DeckService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.deck.create({
            data: {
                title: dto.title,
                description: dto.description,
                userId: dto.userId,
            },
        });
    }
    async findAllByUser(userId) {
        return this.prisma.deck.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { flashcards: true },
                },
            },
        });
    }
    async findOne(id) {
        const deck = await this.prisma.deck.findUnique({
            where: { id },
            include: {
                flashcards: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: { flashcards: true },
                },
            },
        });
        if (!deck) {
            throw new common_1.NotFoundException(`Deck (ID: ${id}) topilmadi`);
        }
        return deck;
    }
    async update(id, userId, dto) {
        await this.checkOwnership(id, userId);
        return this.prisma.deck.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, userId) {
        await this.checkOwnership(id, userId);
        await this.prisma.deck.delete({ where: { id } });
        return { success: true, message: "Deck o'chirildi" };
    }
    async checkOwnership(deckId, userId) {
        const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
        if (!deck) {
            throw new common_1.NotFoundException(`Deck (ID: ${deckId}) topilmadi`);
        }
        if (deck.userId !== userId) {
            throw new common_1.ForbiddenException('Bu deck sizga tegishli emas');
        }
        return deck;
    }
};
exports.DeckService = DeckService;
exports.DeckService = DeckService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], DeckService);
//# sourceMappingURL=deck.service.js.map