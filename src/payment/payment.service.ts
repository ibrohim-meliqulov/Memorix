// src/payment/payment.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { PaymentStatus, Plan } from '@prisma/client';

@Injectable()
export class PaymentService {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!, // service_role key — server side
    );

    constructor(private prisma: PrismaService) { }

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

        console.log('--- SUPABASE UPLOAD DEBUG ---');
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
        console.log('SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length);
        console.log('fileName:', fileName);
        console.log('file size:', file?.buffer?.length);

        // ── XOM FETCH TESTI: server umuman tashqi internetga chiqa olyaptimi? ──
        try {
            const testRes = await fetch(process.env.SUPABASE_URL!);
            console.log('RAW FETCH TEST status:', testRes.status);
        } catch (rawErr: any) {
            console.log('RAW FETCH TEST FAILED:', rawErr?.message);
            console.log('RAW FETCH TEST cause:', JSON.stringify(rawErr?.cause));
            console.log('RAW FETCH TEST full:', rawErr);
        }

        const { error } = await this.supabase.storage
            .from('payment-checks') // bucket nomi
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            console.log('--- SUPABASE UPLOAD ERROR (full) ---');
            console.log(JSON.stringify(error, null, 2));
            console.log('error.name:', (error as any)?.name);
            console.log('error.cause:', JSON.stringify((error as any)?.cause));
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

    async approveRequest(requestId: number) {
        const request = await this.prisma.paymentRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) throw new NotFoundException('So\'rov topilmadi');
        if (request.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Bu so\'rov allaqachon ko\'rib chiqilgan');
        }

        // Tranzaksiya: status + subscription bir vaqtda yangilansin
        const [updated] = await this.prisma.$transaction([
            // 1. PaymentRequest → APPROVED
            this.prisma.paymentRequest.update({
                where: { id: requestId },
                data: { status: PaymentStatus.APPROVED },
            }),

            // 2. Subscription yangilash yoki yaratish
            this.prisma.subscription.upsert({
                where: { userId: request.userId },
                update: {
                    plan: request.plan,
                    expiresAt: getExpiryDate(request.plan),
                },
                create: {
                    userId: request.userId,
                    plan: request.plan,
                    expiresAt: getExpiryDate(request.plan),
                },
            }),
        ]);

        return {
            message: `So'rov tasdiqlandi. User ga ${request.plan} plan berildi.`,
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