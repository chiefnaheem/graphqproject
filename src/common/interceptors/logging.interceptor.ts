import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType<string>() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context);
            const info = gqlContext.getInfo();
            const fieldName = info.fieldName;
            const parentType = info.parentType.name;

            const now = Date.now();
            return next
                .handle()
                .pipe(
                    tap(() => this.logger.log(`${parentType} » ${fieldName} [${Date.now() - now}ms]`)),
                );
        }

        // HTTP
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        const now = Date.now();

        return next
            .handle()
            .pipe(
                tap(() => this.logger.log(`${method} ${url} [${Date.now() - now}ms]`)),
            );
    }
}
