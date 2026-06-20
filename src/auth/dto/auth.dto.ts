// src/auth/dto/auth.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramAuthDto {
    @IsString()
    @IsNotEmpty({ message: "initData bo'sh bo'lishi mumkin emas" })
    initData: string; // Telegram.WebApp.initData ni frontend shu yerda yuboradi
}