import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
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
                text: '🚀 Memorix ni ochish',
                web_app: { url: 'https://memorix-front.vercel.app' }
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
        `4️⃣ Flashcard saqlab, o'rganishni boshlang!\n\n` +
        `💡 Maslahat: Lug'at sahifasi yoki inglizcha yangiliklar rasmini yuklang`,
        { parse_mode: 'Markdown' }
      );
    });

    this.logger.log('✅ Bot service initialized');
  }

  getBot() {
    return this.bot;
  }
}
