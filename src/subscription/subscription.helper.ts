// src/subscription/subscription.helper.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan } from '@prisma/client';

// Kunlik AI chaqiruv limitlari (plan bo'yicha)
export const AI_DAILY_LIMITS: Record<Plan, number> = {
    FREE: 5,
    STARTER: 20,
    PRO: 50,
    B2B: Infinity,
};

@Injectable()
export class SubscriptionHelper {
    constructor(private prisma: PrismaService) { }

    /**
     * Subscription muddati tugaganmi tekshiradi, tugagan bo'lsa FREE'ga qaytaradi.
     * Har bir muhim so'rovdan oldin (stats, deck yaratish, AI chaqiruv) shu chaqiriladi.
     * Joriy (yangilangan) Subscription'ni qaytaradi.
     */
    async getActiveSubscription(userId: number) {
        let sub = await this.prisma.subscription.findUnique({ where: { userId } });

        if (!sub) {
            // Hech qachon subscription yaratilmagan bo'lsa (eski userlar uchun ehtiyot)
            sub = await this.prisma.subscription.create({
                data: { userId, plan: 'FREE' },
            });
            return sub;
        }

        const isExpired =
            sub.expiresAt && sub.expiresAt.getTime() < Date.now() && sub.plan !== 'FREE';

        if (isExpired) {
            sub = await this.prisma.subscription.update({
                where: { userId },
                data: { plan: 'FREE', expiresAt: null },
            });
        }

        return sub;
    }

    /**
     * AI chaqiruv ruxsatini tekshiradi va hisoblagichni oshiradi.
     * Limit oshib ketgan bo'lsa BadRequestException tashlaydi.
     * Ruxsat berilsa, aiCallsToday +1 qilinadi.
     */
    async checkAndIncrementAiUsage(userId: number) {
        const sub = await this.getActiveSubscription(userId);
        const limit = AI_DAILY_LIMITS[sub.plan] ?? AI_DAILY_LIMITS.FREE;

        if (limit === Infinity) {
            // B2B kabi cheksiz planlar uchun hisoblash shart emas
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const resetAt = sub.aiCallsResetAt;
        const needsReset = !resetAt || resetAt.getTime() < today.getTime();

        const currentCount = needsReset ? 0 : sub.aiCallsToday;

        if (currentCount >= limit) {
            const upgrade =
                sub.plan === 'FREE' ? 'Starter yoki Premium' : sub.plan === 'STARTER' ? 'Premium' : null;
            const upgradeMsg = upgrade ? ` ${upgrade} rejaga o'ting!` : '';
            throw new BadRequestException(
                `Kunlik AI limiti tugadi (${limit} ta/kun).${upgradeMsg} Ertaga qayta urinib ko'ring.`,
            );
        }

        await this.prisma.subscription.update({
            where: { userId },
            data: {
                aiCallsToday: currentCount + 1,
                aiCallsResetAt: needsReset ? today : resetAt,
            },
        });
    }
}