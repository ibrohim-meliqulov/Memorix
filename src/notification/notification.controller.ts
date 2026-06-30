// src/notification/notification.controller.ts

import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    // GET /notifications — qo'ng'iroq belgisi bosilganda ro'yxat
    @Get()
    findAllByUser(@CurrentUser() user: CurrentUserData) {
        return this.notificationService.findAllByUser(user.userId);
    }

    // GET /notifications/unread-count — qo'ng'iroq ustidagi qizil raqam uchun
    @Get('unread-count')
    getUnreadCount(@CurrentUser() user: CurrentUserData) {
        return this.notificationService.getUnreadCount(user.userId);
    }

    // PATCH /notifications/:id/read
    @Patch(':id/read')
    markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
        return this.notificationService.markAsRead(id, user.userId);
    }

    // PATCH /notifications/read-all
    @Patch('read-all')
    markAllAsRead(@CurrentUser() user: CurrentUserData) {
        return this.notificationService.markAllAsRead(user.userId);
    }

    // DELETE /notifications/:id
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
        return this.notificationService.remove(id, user.userId);
    }
}