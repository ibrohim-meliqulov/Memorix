// src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST /auth/telegram
    // Frontend: Telegram.WebApp.initData ni shu yerga yuboradi
    @Post('telegram')
    loginWithTelegram(@Body() dto: TelegramAuthDto) {
        return this.authService.loginWithTelegram(dto.initData);
    }

    // POST /auth/dev-login
    // FAQAT development uchun (Postman/curl bilan test qilish uchun)
    @Post('dev-login')
    loginDevMode(@Body('telegramId') telegramId: string) {
        return this.authService.loginDevMode(telegramId);
    }
}