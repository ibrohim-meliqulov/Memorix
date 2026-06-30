// src/notification/notification.module.ts

import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService], // boshqa modullar (payment) foydalanishi uchun
})
export class NotificationModule { }