import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BotService } from './bot/bot.service';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Barcha xatolarni to'liq tafsilot bilan Render Logs'ga yozadi
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 10000;

  // Bot webhook
  const botService = app.get(BotService);
  const bot = botService.getBot();
  app.use(bot.webhookCallback('/webhook'));

  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}
bootstrap();