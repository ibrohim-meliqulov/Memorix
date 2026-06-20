// src/deck/deck.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';

@Controller('decks')
export class DeckController {
    constructor(private readonly deckService: DeckService) { }

    // POST /decks
    @Post()
    create(@Body() dto: CreateDeckDto) {
        return this.deckService.create(dto);
    }

    // GET /decks?userId=1
    @Get()
    findAllByUser(@Query('userId', ParseIntPipe) userId: number) {
        return this.deckService.findAllByUser(userId);
    }

    // GET /decks/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.deckService.findOne(id);
    }

    // PATCH /decks/:id?userId=1
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Query('userId', ParseIntPipe) userId: number,
        @Body() dto: UpdateDeckDto,
    ) {
        return this.deckService.update(id, userId, dto);
    }

    // DELETE /decks/:id?userId=1
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        return this.deckService.remove(id, userId);
    }
}