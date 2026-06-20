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
export declare function validateTelegramInitData(initData: string, botToken: string, maxAgeSeconds?: number): ParsedInitData;
