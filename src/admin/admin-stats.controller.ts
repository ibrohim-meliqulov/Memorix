// src/admin/admin-stats.controller.ts
//
// GET /admin/stats — AdminGuard bilan himoyalangan.
// Jami ro'yxatdan o'tgan foydalanuvchilar sonini va
// Free / Starter / Premium (PRO) / B2B bo'yicha foizli taqsimotni qaytaradi.
//
// Eslatma: `plan` maydoni User'da emas, Subscription modelida (1:1).
// Subscription yozuvi hali yaratilmagan userlar (agar bunday holat
// mumkin bo'lsa) FREE deb hisoblanadi, chunki Plan enum default'i FREE.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../prisma/prisma.service'; // ⚠️ moslang: haqiqiy yo'l

const PLAN_KEYS = ['FREE', 'STARTER', 'PRO', 'B2B'] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

@Controller('admin/stats')
@UseGuards(AdminGuard)
export class AdminStatsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getStats() {
        const [totalUsers, grouped, usersWithSubscription] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.subscription.groupBy({
                by: ['plan'],
                _count: { _all: true },
            }),
            this.prisma.subscription.count(),
        ]);

        // groupBy natijasini { FREE: n, STARTER: n, PRO: n, B2B: n } shakliga keltiramiz
        const counts: Record<PlanKey, number> = { FREE: 0, STARTER: 0, PRO: 0, B2B: 0 };
        for (const row of grouped) {
            counts[row.plan as PlanKey] = row._count._all;
        }

        // Subscription yozuvi yo'q userlar — Plan enum default'i FREE bo'lgani uchun FREE'ga qo'shamiz
        const usersWithoutSubscription = totalUsers - usersWithSubscription;
        if (usersWithoutSubscription > 0) {
            counts.FREE += usersWithoutSubscription;
        }

        const pct = (n: number) =>
            totalUsers === 0 ? 0 : Math.round((n / totalUsers) * 1000) / 10;

        return {
            total: totalUsers,
            byPlan: {
                free: { count: counts.FREE, percent: pct(counts.FREE) },
                starter: { count: counts.STARTER, percent: pct(counts.STARTER) },
                pro: { count: counts.PRO, percent: pct(counts.PRO) },
                b2b: { count: counts.B2B, percent: pct(counts.B2B) },
            },
        };
    }
}