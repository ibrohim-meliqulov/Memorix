// src/deck/deck.module.ts

import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
    imports: [SubscriptionModule],
    controllers: [DeckController],
    providers: [DeckService],
    exports: [DeckService],
})
export class DeckModule { }