// src/common/all-exceptions.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Barcha xatolarni ushlab, to'liq tafsilotni Render Logs'ga yozadi,
 * keyin foydalanuvchiga (frontendga) qisqa, tushunarli xabar qaytaradi.
 *
 * Ulash uchun main.ts ga qo'shing:
 *   app.useGlobalFilters(new AllExceptionsFilter());
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('AllExceptionsFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isHttpException = exception instanceof HttpException;
        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = isHttpException
            ? exception.getResponse()
            : (exception as any)?.message || 'Server xatosi';

        // ── TO'LIQ LOG (Render Logs'da ko'rinadi) ──────────────────────────────
        this.logger.error(
            `[${request.method}] ${request.url} → ${status}`,
        );
        this.logger.error(`Message: ${JSON.stringify(message)}`);

        if (exception instanceof Error) {
            this.logger.error(`Stack: ${exception.stack}`);
            // Supabase/fetch kabi xatolarda "cause" ichida asl sabab bo'ladi
            if ((exception as any).cause) {
                this.logger.error(`Cause: ${JSON.stringify((exception as any).cause, null, 2)}`);
            }
        } else {
            this.logger.error(`Raw exception: ${JSON.stringify(exception, null, 2)}`);
        }

        // ── FRONTEND'GA QAYTARILADIGAN JAVOB ───────────────────────────────────
        response.status(status).json(
            typeof message === 'string'
                ? { statusCode: status, message }
                : { statusCode: status, ...(message as object) },
        );
    }
}