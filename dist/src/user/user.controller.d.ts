import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import type { CurrentUserData } from '../auth/current-user.decorator';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getMe(user: CurrentUserData): Promise<{
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
    }>;
    getMyStats(user: CurrentUserData): Promise<{
        userId: number;
        firstName: string | null;
        plan: import(".prisma/client").$Enums.Plan;
        totalDecks: number;
        totalFlashcards: number;
        memberSince: Date;
    }>;
    updateMe(user: CurrentUserData, dto: UpdateUserDto): Promise<{
        id: number;
        telegramId: string;
        username: string | null;
        firstName: string | null;
        createdAt: Date;
    }>;
    removeMe(user: CurrentUserData): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: number): Promise<{
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
    }>;
}
