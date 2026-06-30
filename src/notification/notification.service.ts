// src/notification/notification.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    // Boshqa servislar (payment, deck va h.k.) shu metodni chaqirib
    // yangi notification yaratadi
    async create(dto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                userId: dto.userId,
                title: dto.title,
                message: dto.message,
                type: dto.type ?? 'INFO',
            },
        });
    }

    async findAllByUser(userId: number) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getUnreadCount(userId: number) {
        const count = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return { count };
    }

    async markAsRead(id: number, userId: number) {
        const notif = await this.prisma.notification.findUnique({ where: { id } });
        if (!notif) throw new NotFoundException(`Notification (ID: ${id}) topilmadi`);
        if (notif.userId !== userId) throw new ForbiddenException('Bu notification sizga tegishli emas');

        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: number) {
        await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return { success: true, message: "Barcha xabarlar o'qilgan deb belgilandi" };
    }

    async remove(id: number, userId: number) {
        const notif = await this.prisma.notification.findUnique({ where: { id } });
        if (!notif) throw new NotFoundException(`Notification (ID: ${id}) topilmadi`);
        if (notif.userId !== userId) throw new ForbiddenException('Bu notification sizga tegishli emas');

        await this.prisma.notification.delete({ where: { id } });
        return { success: true, message: "Notification o'chirildi" };
    }
}