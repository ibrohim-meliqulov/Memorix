// src/payment/payment.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { PaymentStatus, Plan } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PaymentService {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!, // service_role key — server side
    );

    constructor(private prisma: PrismaService,
        private notificationService: NotificationService

    ) { }

    // ─── USER: Chek yuklash ───────────────────────────────────────────────────

    async uploadCheck(
        userId: number,
        plan: Plan,
        file: Express.Multer.File,
    ) {
        // 1. Fayl turini tekshirish
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowed.includes(file.mimetype)) {
            throw new BadRequestException('Faqat JPG, PNG, WEBP formatlar qabul qilinadi');
        }

        // 2. Supabase Storage ga yuklash
        const fileName = `checks/${userId}_${Date.now()}_${file.originalname}`;

        const { error } = await this.supabase.storage
            .from('payment-checks') // bucket nomi
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new BadRequestException(`Fayl yuklanmadi: ${error.message}`);
        }

        // 3. Public URL olish
        const { data: urlData } = this.supabase.storage
            .from('payment-checks')
            .getPublicUrl(fileName);

        const checkUrl = urlData.publicUrl;

        // 4. Avvalgi PENDING so'rovni bekor qilish (duplicate oldini olish)
        await this.prisma.paymentRequest.updateMany({
            where: { userId, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.REJECTED },
        });

        // 5. Yangi PaymentRequest yaratish
        const request = await this.prisma.paymentRequest.create({
            data: {
                userId,
                plan,
                checkUrl,
                status: PaymentStatus.PENDING,
            },
        });

        return {
            message: 'Chek muvaffaqiyatli yuklandi. Admin tekshiradi.',
            requestId: request.id,
            checkUrl,
        };
    }

    // ─── USER: O'z so'rovlarini ko'rish ───────────────────────────────────────

    async getMyRequests(userId: number) {
        return this.prisma.paymentRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                plan: true,
                status: true,
                checkUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    // ─── ADMIN: Barcha so'rovlarni ko'rish ───────────────────────────────────

    async getAllRequests(status?: PaymentStatus) {
        return this.prisma.paymentRequest.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        firstName: true,
                        telegramId: true,
                    },
                },
            },
        });
    }

    // ─── ADMIN: So'rovni tasdiqlash ───────────────────────────────────────────
    // overridePlan berilsa, user so'ragan plan o'rniga shu plan beriladi
    // (masalan user "Starter" tugmasini bosgan, lekin chekda "Premium" puli
    // ko'rinsa, admin shu yerda to'g'rilab tasdiqlay oladi)

    async approveRequest(requestId: number, overridePlan?: Plan) {
        const request = await this.prisma.paymentRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) throw new NotFoundException('So\'rov topilmadi');
        if (request.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Bu so\'rov allaqachon ko\'rib chiqilgan');
        }

        const finalPlan = overridePlan ?? request.plan;

        // Tranzaksiya: status + subscription bir vaqtda yangilansin
        const [updated] = await this.prisma.$transaction([
            // 1. PaymentRequest → APPROVED (agar plan o'zgartirilgan bo'lsa, shuni ham yozamiz)
            this.prisma.paymentRequest.update({
                where: { id: requestId },
                data: { status: PaymentStatus.APPROVED, plan: finalPlan },
            }),

            // 2. Subscription yangilash yoki yaratish
            this.prisma.subscription.upsert({
                where: { userId: request.userId },
                update: {
                    plan: finalPlan,
                    expiresAt: getExpiryDate(finalPlan),
                },
                create: {
                    userId: request.userId,
                    plan: finalPlan,
                    expiresAt: getExpiryDate(finalPlan),
                },
            }),
        ]);



        // ── YANGI: notification yaratish ──
        await this.notificationService.create({
            userId: request.userId,
            title: "To'lov tasdiqlandi! 🎉",
            message: `Tabriklaymiz! Sizga ${finalPlan} rejasi faollashtirildi.`,
            type: 'PAYMENT',
        });

        return {
            message: `So'rov tasdiqlandi. User ga ${finalPlan} plan berildi.`,
            request: updated,
        };
    }

    // ─── ADMIN: So'rovni rad etish ────────────────────────────────────────────

    async rejectRequest(requestId: number, reason?: string) {
        const request = await this.prisma.paymentRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) throw new NotFoundException('So\'rov topilmadi');
        if (request.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Bu so\'rov allaqachon ko\'rib chiqilgan');
        }

        const updated = await this.prisma.paymentRequest.update({
            where: { id: requestId },
            data: { status: PaymentStatus.REJECTED },
        });

        // ── YANGI: notification yaratish ──
        await this.notificationService.create({
            userId: request.userId,
            title: "To'lov rad etildi",
            message: reason
                ? `Chekingiz rad etildi: ${reason}`
                : "Chekingiz rad etildi. Iltimos qaytadan urinib ko'ring yoki admin bilan bog'laning.",
            type: 'WARNING',
        });

        return {
            message: 'So\'rov rad etildi.',
            reason: reason ?? 'Sabab ko\'rsatilmadi',
            request: updated,
        };
    }
}

// ─── Helper: Plan ga qarab muddatni hisoblash ────────────────────────────────

function getExpiryDate(plan: Plan): Date | null {
    const now = new Date();
    switch (plan) {
        case Plan.STARTER:
            return new Date(now.setMonth(now.getMonth() + 1)); // 1 oy
        case Plan.PRO:
            return new Date(now.setMonth(now.getMonth() + 1)); // 1 oy
        case Plan.B2B:
            return new Date(now.setFullYear(now.getFullYear() + 1)); // 1 yil
        default:
            return null; // FREE — muddatsiz
    }
}