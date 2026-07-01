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
  constructor(private readonly userService: UserService) { }

  // GET /users/me — joriy foydalanuvchi profili
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: CurrentUserData) {
    return this.userService.findOne(user.userId);
  }

  // GET /users/me/stats — statistika + onboarded holati
  // Frontend shu endpointdan onboarded ni o'qiydi
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  getMyStats(@CurrentUser() user: CurrentUserData) {
    return this.userService.getStats(user.userId);
  }

  // PATCH /users/me — profilni yangilash (onboarded: true ham shu orqali)
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


  // PATCH /users/me/weekly-goal
  @UseGuards(JwtAuthGuard)
  @Patch('me/weekly-goal')
  updateWeeklyGoal(
    @CurrentUser() user: CurrentUserData,
    @Body('weeklyGoal') weeklyGoal: number,
  ) {
    return this.userService.updateWeeklyGoal(user.userId, weeklyGoal);
  }



  // Plan yangilash (admin)
  @Patch(':id/plan')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: { plan: 'FREE' | 'STARTER' | 'PRO' | 'B2B' },
  ) {
    return this.userService.updatePlan(+id, body.plan);
  }

  // ID bo'yicha qidirish (admin)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}