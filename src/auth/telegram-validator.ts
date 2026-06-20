// src/auth/telegram-validator.ts

import * as crypto from 'crypto';

export interface TelegramUserData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export interface ParsedInitData {
    user: TelegramUserData;
    authDate: number;
    queryId?: string;
}

/**
 * Telegram Mini App initData ni tasdiqlaydi (HMAC-SHA256)
 * Rasmiy hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
    initData: string,
    botToken: string,
    maxAgeSeconds = 86400, // 24 soat (xohlasangiz qisqartirishingiz mumkin)
): ParsedInitData {
    const urlParams = new URLSearchParams(initData);

    const hash = urlParams.get('hash');
    if (!hash) {
        throw new Error("initData ichida 'hash' topilmadi");
    }
    urlParams.delete('hash');

    // 1. Field'larni alifbo tartibida saralash
    const dataCheckArr: string[] = [];
    urlParams.sort();
    urlParams.forEach((value, key) => {
        dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');

    // 2. secret_key = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    // 3. calculated_hash = HMAC_SHA256(data_check_string, secret_key)
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // 4. Solishtirish
    if (calculatedHash !== hash) {
        throw new Error("initData imzosi noto'g'ri — Telegram'dan kelmagan bo'lishi mumkin");
    }

    // 5. Vaqtni tekshirish (eskirgan so'rovlarni rad etish)
    const authDate = Number(urlParams.get('auth_date'));
    if (!authDate) {
        throw new Error('auth_date topilmadi');
    }
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAgeSeconds) {
        throw new Error('initData eskirgan, qayta kiring');
    }

    // 6. User ma'lumotini parse qilish
    const userJson = urlParams.get('user');
    if (!userJson) {
        throw new Error("initData ichida 'user' topilmadi");
    }

    const user: TelegramUserData = JSON.parse(userJson);

    return {
        user,
        authDate,
        queryId: urlParams.get('query_id') ?? undefined,
    };
}