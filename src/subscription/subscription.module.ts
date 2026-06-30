// src/subscription/subscription.module.ts

import { Module } from '@nestjs/common';
import { SubscriptionHelper } from './subscription.helper';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [SubscriptionHelper],
    exports: [SubscriptionHelper],
})
export class SubscriptionModule { }