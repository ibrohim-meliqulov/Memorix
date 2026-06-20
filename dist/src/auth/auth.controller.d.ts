import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    loginWithTelegram(dto: TelegramAuthDto): Promise<{
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
}
