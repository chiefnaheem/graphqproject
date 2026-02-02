import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const isGraphql = host.getType<string>() === 'graphql';

        if (isGraphql) {
            if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error(exception);
            }
            return;
        }

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message:
                exception instanceof HttpException
                    ? exception.message
                    : 'Internal Server Error',
        };

        if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(exception);
        }

        // GraphQL handles exceptions differently, so we might not want to intercept everything if we were pure GQL.
        // However, for REST endpoints (health checks, etc) this is useful.
        // For GQL, NestJS has GqlExceptionFilter.
        // Ideally we'd separate them or use GqlArgumentsHost. 
        // But since this is a mixed app (or mostly GQL), let's ensure we don't break GQL errors.

        // Check if it's GQL context
        if (host.getType<string>() === 'graphql') {
            // Let NestJS GraphQL handle it, or log it here.
            if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error('GraphQL Error', exception);
            }
            return;
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
