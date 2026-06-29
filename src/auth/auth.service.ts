// src/auth/auth.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  // ─── Google orqali login (asosiy) ─────────────────────────────────────
  async loginWithGoogle(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    username: string;
  }) {
    const user = await this.userService.findOrCreateByGoogle(googleUser);
    const accessToken = this.generateToken(user.id, user.email!);
    this.logger.log(`Google login: ${user.email}`);
    return { accessToken, user };
  }

  // ─── Bot uchun Google login URL ────────────────────────────────────────
  // Telegram bot bu URLni foydalanuvchiga tugma sifatida yuboradi
  getBotLoginUrl(): string {
    const baseUrl = this.configService.get<string>('BACKEND_URL') ?? 'https://api.memorix.uz';
    return `${baseUrl}/auth/google`;
  }

  // ─── JWT token yaratish ────────────────────────────────────────────────
  generateToken(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  // Dev rejimi uchun (test)
  async loginDevMode(email: string) {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error("Dev login production'da o'chirilgan");
    }

    const user = await this.userService.findOrCreateByGoogle({
      googleId: `dev_${email}`,
      email,
      firstName: 'Dev User',
      username: email.split('@')[0],
    });

    const accessToken = this.generateToken(user.id, user.email!);
    return { success: true, accessToken, user };
  }
}