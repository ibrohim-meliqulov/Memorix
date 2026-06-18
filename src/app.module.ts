import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, FlashcardModule, AiModule, UploadModule, UserModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
