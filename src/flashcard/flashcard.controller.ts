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
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import {
    CreateFlashcardDto,
    UpdateFlashcardDto,
    BulkCreateFlashcardDto,
} from './dto/flashcard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardController {
    constructor(private readonly flashcardService: FlashcardService) { }

    @Post()
    create(@Body() dto: CreateFlashcardDto) {
        return this.flashcardService.create(dto);
    }

    // POST /flashcards/bulk  ← AI natijasini saqlash uchun
    @Post('bulk')
    bulkCreate(@Body() dto: BulkCreateFlashcardDto) {
        return this.flashcardService.bulkCreate(dto);
    }

    @Get()
    findAllByDeck(@Query('deckId', ParseIntPipe) deckId: number) {
        return this.flashcardService.findAllByDeck(deckId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.flashcardService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFlashcardDto) {
        return this.flashcardService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.flashcardService.remove(id);
    }
}