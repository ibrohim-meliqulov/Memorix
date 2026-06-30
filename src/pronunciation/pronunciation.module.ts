import { Module } from '@nestjs/common';
import { PronunciationService } from './pronunciation.service';
import { PronunciationController } from './pronunciation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PronunciationController],
    providers: [PronunciationService],
})
export class PronunciationModule { }