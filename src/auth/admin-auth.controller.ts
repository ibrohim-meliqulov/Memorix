// src/auth/admin-auth.controller.ts

import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('admin-auth')
export class AdminAuthController {
    constructor(private jwtService: JwtService) { }

    /**
     * POST /admin-auth/login
     * Body: { email, password }
     * .env dagi ADMIN_EMAIL va ADMIN_PASSWORD bilan solishtiriladi.
     * To'g'ri bo'lsa — JWT token qaytaradi (email payload'ida bor,
     * shu token bilan AdminGuard'dan o'tib bo'ladi).
     */
    @Post('login')
    login(@Body('email') email: string, @Body('password') password: string) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new UnauthorizedException(
                'Admin login sozlanmagan (.env da ADMIN_EMAIL/ADMIN_PASSWORD yo\'q)',
            );
        }

        if (email !== adminEmail || password !== adminPassword) {
            throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
        }

        // AdminGuard / JwtStrategy bilan mos formatda token yaratamiz: { sub, email }
        // userId sifatida 0 ishlatamiz (admin User jadvalida bo'lishi shart emas)
        const accessToken = this.jwtService.sign({ sub: 0, email: adminEmail });

        return { accessToken };
    }
}