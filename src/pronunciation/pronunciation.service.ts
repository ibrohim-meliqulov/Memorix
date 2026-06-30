// src/pronunciation/pronunciation.service.ts
import * as crypto from 'crypto'; // faylning eng tepasiga qo'shing
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from 'src/prisma/prisma.service';

// Til kodlari va WaveNet ovozlari — Google Cloud TTS uchun
const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
    english: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
    russian: { languageCode: 'ru-RU', name: 'ru-RU-Wavenet-D' },
    korean: { languageCode: 'ko-KR', name: 'ko-KR-Wavenet-A' },
};

@Injectable()
export class PronunciationService {
    private readonly logger = new Logger(PronunciationService.name);

    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
    );

    constructor(private prisma: PrismaService) { }

    async getAudioUrl(text: string, lang: string): Promise<string> {
        const voice = VOICE_MAP[lang];
        if (!voice) {
            throw new BadRequestException(`Noma'lum til: ${lang}`);
        }

        const normalizedText = text.trim().toLowerCase();
        const langCode = voice.languageCode;

        // 1. Keshdan tekshiramiz — avval shu so'z uchun audio yaratilganmi?
        const cached = await this.prisma.pronunciationCache.findUnique({
            where: { text_langCode: { text: normalizedText, langCode } },
        });
        if (cached) {
            return cached.audioUrl;
        }

        // 2. Google Cloud TTS'ga so'rov yuboramiz
        const apiKey = process.env.GOOGLE_TTS_API_KEY;
        if (!apiKey) {
            throw new BadRequestException('GOOGLE_TTS_API_KEY sozlanmagan');
        }

        const res = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text: normalizedText },
                    voice: { languageCode: voice.languageCode, name: voice.name },
                    audioConfig: { audioEncoding: 'MP3' },
                }),
            },
        );

        if (!res.ok) {
            const errBody = await res.text();
            this.logger.error(`Google TTS xato: ${errBody}`);
            throw new BadRequestException('Talaffuz yaratishda xatolik');
        }

        const data = await res.json();
        const audioContent: string = data.audioContent; // base64
        const buffer = Buffer.from(audioContent, 'base64');

        // 3. Supabase Storage'ga yuklaymiz
        const hash = crypto
            .createHash('md5')
            .update(`${langCode}_${normalizedText}`)
            .digest('hex');
        const fileName = `pronunciation/${hash}.mp3`;

        const { error } = await this.supabase.storage
            .from('pronunciation-audio') // bucket nomi — avval yaratish kerak
            .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                upsert: true,
            });

        if (error) {
            this.logger.error(`Supabase yuklash xatosi: ${error.message}`);
            throw new BadRequestException('Audio saqlashda xatolik');
        }

        const { data: urlData } = this.supabase.storage
            .from('pronunciation-audio')
            .getPublicUrl(fileName);

        const audioUrl = urlData.publicUrl;

        // 4. Keshga yozamiz — keyingi safar Google'ga so'rov ketmaydi
        await this.prisma.pronunciationCache.create({
            data: { text: normalizedText, langCode, audioUrl },
        });

        return audioUrl;
    }
}