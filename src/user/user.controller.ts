// src/user/user.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // POST /users/telegram-auth
    // Telegram Mini App ochilganda shu chaqiriladi
    @Post('telegram-auth')
    findOrCreate(@Body() dto: CreateUserDto) {
        return this.userService.findOrCreate(dto);
    }

    // GET /users/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    // GET /users/telegram/:telegramId
    @Get('telegram/:telegramId')
    findByTelegramId(@Param('telegramId') telegramId: string) {
        return this.userService.findByTelegramId(telegramId);
    }

    // GET /users/:id/stats
    @Get(':id/stats')
    getStats(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getStats(id);
    }

    // PATCH /users/:id
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    // DELETE /users/:id
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}