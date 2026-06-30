// src/payment/payment.module.ts

import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule { }