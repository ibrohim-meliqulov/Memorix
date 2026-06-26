// src/auth/auth.controller.ts

import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('telegram')
    loginWithTelegram(@Body() dto: TelegramAuthDto) {
        return this.authService.loginWithTelegram(dto.initData);
    }

    @Post('dev-login')
    loginDevMode(@Body('telegramId') telegramId: string) {
        return this.authService.loginDevMode(telegramId);
    }

    // auth.controller.ts
    @Get('web')
    async webLogin(@Query() query: Record<string, string>, @Res() res: any) {
        try {
            const result = await this.authService.verifyTelegramWebLogin(query);
            // Mini App ga token bilan redirect
            res.redirect(`https://memorix-front.vercel.app?token=${result.accessToken}`);
        } catch (err) {
            // Landing page ga qaytarish
            res.redirect(`https://memorix-front.vercel.app?error=auth_failed`);
        }
    }
}