import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsInt()
    userId: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;
}