import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findOrCreate(dto: CreateUserDto): Promise<{
        id: number;
        telegramId: string;
        username: string | null;
        firstName: string | null;
        createdAt: Date;
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
    findByTelegramId(telegramId: string): Promise<{
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
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        telegramId: string;
        username: string | null;
        firstName: string | null;
        createdAt: Date;
    }>;
    getStats(id: number): Promise<{
        userId: number;
        firstName: string | null;
        plan: import(".prisma/client").$Enums.Plan;
        totalDecks: number;
        totalFlashcards: number;
        memberSince: Date;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
