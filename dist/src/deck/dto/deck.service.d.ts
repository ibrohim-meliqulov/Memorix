import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';
export declare class DeckService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDeckDto): Promise<any>;
    findAllByUser(userId: number): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, userId: number, dto: UpdateDeckDto): Promise<any>;
    remove(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private checkOwnership;
}
