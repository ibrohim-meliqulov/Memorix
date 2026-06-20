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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_validator_1 = require("./telegram-validator");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    configService;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, configService, jwtService) {
        this.prisma = prisma;
        this.configService = configService;
        this.jwtService = jwtService;
    }
    async loginWithTelegram(initData) {
        const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN .env faylda sozlanmagan');
        }
        let parsed;
        try {
            parsed = (0, telegram_validator_1.validateTelegramInitData)(initData, botToken);
        }
        catch (error) {
            this.logger.warn(`Telegram auth rad etildi: ${error.message}`);
            throw new common_1.UnauthorizedException("Telegram autentifikatsiyasi muvaffaqiyatsiz");
        }
        const { user: tgUser } = parsed;
        const telegramId = String(tgUser.id);
        let user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { subscription: true },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    telegramId,
                    username: tgUser.username,
                    firstName: tgUser.first_name,
                    subscription: { create: { plan: 'FREE' } },
                },
                include: { subscription: true },
            });
            this.logger.log(`Yangi foydalanuvchi yaratildi: ${telegramId}`);
        }
        const accessToken = this.generateToken(user.id, user.telegramId);
        return {
            success: true,
            accessToken,
            user,
        };
    }
    async loginDevMode(telegramId) {
        if (this.configService.get('NODE_ENV') === 'production') {
            throw new common_1.UnauthorizedException("Dev login production'da o'chirilgan");
        }
        let user = await this.prisma.user.findUnique({
            where: { telegramId },
            include: { subscription: true },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    telegramId,
                    username: `dev_${telegramId}`,
                    firstName: 'Dev User',
                    subscription: { create: { plan: 'FREE' } },
                },
                include: { subscription: true },
            });
        }
        const accessToken = this.generateToken(user.id, user.telegramId);
        return { success: true, accessToken, user };
    }
    generateToken(userId, telegramId) {
        return this.jwtService.sign({
            sub: userId,
            telegramId,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map