// src/flashcard/flashcard.controller.ts

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
import { FlashcardService } from './flashcard.service';
import {
    CreateFlashcardDto,
    UpdateFlashcardDto,
    BulkCreateFlashcardDto,
} from './dto/flashcard.dto';

@Controller('flashcards')
export class FlashcardController {
    constructor(private readonly flashcardService: FlashcardService) { }

    // POST /flashcards
    @Post()
    create(@Body() dto: CreateFlashcardDto) {
        return this.flashcardService.create(dto);
    }

    // POST /flashcards/bulk  ← AI natijasini saqlash uchun
    @Post('bulk')
    bulkCreate(@Body() dto: BulkCreateFlashcardDto) {
        return this.flashcardService.bulkCreate(dto);
    }

    // GET /flashcards?deckId=1
    @Get()
    findAllByDeck(@Query('deckId', ParseIntPipe) deckId: number) {
        return this.flashcardService.findAllByDeck(deckId);
    }

    // GET /flashcards/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.flashcardService.findOne(id);
    }

    // PATCH /flashcards/:id
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFlashcardDto) {
        return this.flashcardService.update(id, dto);
    }

    // DELETE /flashcards/:id
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.flashcardService.remove(id);
    }
}