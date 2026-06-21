// src/user/user.controller.ts

import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users/me  — joriy foydalanuvchi profili (himoyalangan)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: CurrentUserData) {
    return this.userService.findOne(user.userId);
  }

  // GET /users/me/stats — joriy foydalanuvchi statistikasi
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  getMyStats(@CurrentUser() user: CurrentUserData) {
    return this.userService.getStats(user.userId);
  }

  // PATCH /users/me — profilni tahrirlash
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.userId, dto);
  }

  // DELETE /users/me — akkauntni o'chirish
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  removeMe(@CurrentUser() user: CurrentUserData) {
    return this.userService.remove(user.userId);
  }

  // ─── Quyidagilar ID orqali (masalan adminlik uchun) — hozircha ochiq ───
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}
