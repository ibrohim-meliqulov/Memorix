// src/auth/auth.controller.ts

import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ─── Google login boshlash ─────────────────────────────────────────────
    // Foydalanuvchi bu URLga o'tsa → Google sahifasiga yo'naltiriladi
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {
        // Passport o'zi yo'naltiradi
    }

    // ─── Google callback ───────────────────────────────────────────────────
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: any, @Res() res: any) {
        const googleUser = req.user;

        const { accessToken, user } = await this.authService.loginWithGoogle({
            googleId: googleUser.googleId ?? googleUser.id,
            email: googleUser.email,
            firstName: googleUser.firstName ?? googleUser.first_name ?? '',
            username: googleUser.username ?? googleUser.displayName ?? '',
        });

        const frontendUrl = process.env.FRONTEND_URL ?? 'https://memorix-front.vercel.app';

        // Token bilan frontend ga qaytamiz
        // onboarded: false bo'lsa frontend onboarding ko'rsatadi
        res.redirect(`${frontendUrl}/auth?token=${accessToken}&onboarded=${user.onboarded ?? false}`);
    }

    // ─── Bot uchun login URL ───────────────────────────────────────────────
    // Telegram bot: GET /auth/bot-login-url → URL qaytaradi
    // Bot bu URLni "Google orqali kirish" tugmasi sifatida yuboradi
    @Get('bot-login-url')
    getBotLoginUrl() {
        return { url: this.authService.getBotLoginUrl() };
    }

    // ─── Dev rejimi (faqat development) ───────────────────────────────────
    @Post('dev-login')
    loginDevMode(@Body('email') email: string) {
        return this.authService.loginDevMode(email);
    }
}