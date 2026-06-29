import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN topilmadi');
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    this.bot.start(async (ctx) => {
      const firstName = ctx.from?.first_name || "Do'st";
      await ctx.reply(
        `👋 Salom, ${firstName}!\n\n` +
        `🧠 *Memorix* — AI yordamida inglizcha so'zlarni o'rganish!\n\n` +
        `✨ Nima qila olasiz:\n` +
        `📸 Rasm ol → AI so'zlarni ajratadi\n` +
        `📝 Matn yoz → AI flashcard yaratadi\n` +
        `🎯 Flip-card usulida o'rganasiz\n\n` +
        `👇 Boshlash uchun tugmani bosing!`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🚀 Memorix ga kirish',
                url: 'https://memorix-landing-sand.vercel.app'  // web_app emas, url
              }
            ]]
          }
        }
      );
    });

    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `📖 *Memorix qanday ishlaydi?*\n\n` +
        `1️⃣ "Yaratish" bo'limiga o'ting\n` +
        `2️⃣ Inglizcha matn yozing yoki rasm yuklang\n` +
        `3️⃣ AI so'zlarni avtomatik ajratadi\n` +
        `4️⃣ Flashcard saqlab, o'rganishni boshlang!`,
        { parse_mode: 'Markdown' }
      );
    });

    // Webhook o'rnatamiz (polling emas!)
    const webhookUrl = `https://memorix-r9gk.onrender.com/webhook`;
    try {
      await this.bot.telegram.setWebhook(webhookUrl);
      this.logger.log(`✅ Webhook set: ${webhookUrl}`);
    } catch (err: any) {
      if (err?.response?.error_code === 429) {
        const retryAfter = (err?.response?.parameters?.retry_after ?? 3) + 1;
        this.logger.warn(`⏳ Rate limit, ${retryAfter}s kutilmoqda...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        await this.bot.telegram.setWebhook(webhookUrl);
        this.logger.log(`✅ Webhook set (retry): ${webhookUrl}`);
      } else {
        this.logger.error('Webhook xatosi: ' + err.message);
      }
    }
  }
  getBot() {
    return this.bot;
  }
}