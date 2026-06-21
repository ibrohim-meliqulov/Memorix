// src/deck/deck.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { UpdateDeckDto } from './dto/deck.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/current-user.decorator';

class CreateDeckBodyDto {
    title: string;
    description?: string;
}

@Controller('decks')
@UseGuards(JwtAuthGuard) // Butun controller himoyalangan
export class DeckController {
    constructor(private readonly deckService: DeckService) { }

    // POST /decks  (Authorization: Bearer <token> kerak)
    @Post()
    create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateDeckBodyDto) {
        return this.deckService.create({ ...dto, userId: user.userId });
    }

    // GET /decks  (faqat o'zining decklarini ko'radi)
    @Get()
    findAllByUser(@CurrentUser() user: CurrentUserData) {
        return this.deckService.findAllByUser(user.userId);
    }

    // GET /decks/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.deckService.findOne(id);
    }

    // PATCH /decks/:id
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: CurrentUserData,
        @Body() dto: UpdateDeckDto,
    ) {
        return this.deckService.update(id, user.userId, dto);
    }

    // DELETE /decks/:id
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
        return this.deckService.remove(id, user.userId);
    }
}