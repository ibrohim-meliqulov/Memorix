import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private configService;
    private jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, jwtService: JwtService);
    loginWithTelegram(initData: string): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            subscription: {
                id: number;
                plan: import(".prisma/client").$Enums.Plan;
                expiresAt: Date | null;
                userId: number;
            } | null;
        } & {
            id: number;
            telegramId: string;
            username: string | null;
            firstName: string | null;
            createdAt: Date;
        };
    }>;
    loginDevMode(telegramId: string): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            subscription: {
                id: number;
                plan: import(".prisma/client").$Enums.Plan;
                expiresAt: Date | null;
                userId: number;
            } | null;
        } & {
            id: number;
            telegramId: string;
            username: string | null;
            firstName: string | null;
            createdAt: Date;
        };
    }>;
    private generateToken;
}
