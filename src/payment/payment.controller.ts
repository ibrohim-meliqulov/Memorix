// src/payment/payment.controller.ts

import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/current-user.decorator';
import { PaymentStatus, Plan } from '@prisma/client';
import { Multer } from 'multer';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    // ─── USER ENDPOINTS ───────────────────────────────────────────────────────

    /**
     * POST /payment/upload
     * Body: multipart/form-data — file (rasm), plan (STARTER | PRO | B2B)
     * Foydalanuvchi chekni yuklaydi
     */
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
        }),
    )
    uploadCheck(
        @CurrentUser() user: CurrentUserData,
        @UploadedFile() file: Express.Multer.File,
        @Body('plan') plan: Plan,
    ) {
        return this.paymentService.uploadCheck(user.userId, plan, file);
    }

    /**
     * GET /payment/my-requests
     * Foydalanuvchi o'z to'lov so'rovlarini ko'radi
     */
    @UseGuards(JwtAuthGuard)
    @Get('my-requests')
    getMyRequests(@CurrentUser() user: CurrentUserData) {
        return this.paymentService.getMyRequests(user.userId);
    }

    // ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────
    // Faqat ADMIN_EMAIL ga teng userlar kira oladi (AdminGuard)

    /**
     * GET /payment/admin/requests?status=PENDING
     * Admin barcha so'rovlarni ko'radi (filter: PENDING | APPROVED | REJECTED)
     */
    @UseGuards(AdminGuard)
    @Get('admin/requests')
    getAllRequests(@Query('status') status?: PaymentStatus) {
        return this.paymentService.getAllRequests(status);
    }

    /**
     * PATCH /payment/admin/approve/:id
     * Admin so'rovni tasdiqlaydi → user ga plan beriladi
     */
    @UseGuards(AdminGuard)
    @Patch('admin/approve/:id')
    approveRequest(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.approveRequest(id);
    }

    /**
     * PATCH /payment/admin/reject/:id
     * Admin so'rovni rad etadi
     */
    @UseGuards(AdminGuard)
    @Patch('admin/reject/:id')
    rejectRequest(
        @Param('id', ParseIntPipe) id: number,
        @Body('reason') reason?: string,
    ) {
        return this.paymentService.rejectRequest(id, reason);
    }
}