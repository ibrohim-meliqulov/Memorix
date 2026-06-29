import { Controller, Post, Body, Get, Query, Res, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('telegram')
    loginWithTelegram(@Body() dto: TelegramAuthDto) {
        return this.authService.loginWithTelegram(dto.initData);
    }

    @Post('dev-login')
    loginDevMode(@Body('telegramId') telegramId: string) {
        return this.authService.loginDevMode(telegramId);
    }

    @Get('web')
    async webLogin(@Query() query: Record<string, string>, @Res() res: any) {
        try {
            const result = await this.authService.verifyTelegramWebLogin(query);
            res.send(`<html><body><script>
                window.opener?.postMessage({token:'${result.accessToken}'},'*');
                window.close();
            </script></body></html>`);
        } catch (err) {
            res.send(`<html><body><script>
                window.opener?.postMessage({error:'auth_failed'},'*');
                window.close();
            </script></body></html>`);
        }
    }

    // Google login boshlash
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() { }

    // Google callback
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: any, @Res() res: any) {
        const user = req.user;
        const token = this.authService.generateTokenPublic(
            user.id,
            user.telegramId ?? `google_${user.googleId}`,
        );
        res.redirect(`https://memorix-front.vercel.app/auth?token=${token}`);
    }
}