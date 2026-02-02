import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { FilesService } from '../files/files.service';
import { UploadMetrics } from './types/metrics.type';

@Resolver()
export class MetricsResolver {
    constructor(private filesService: FilesService) { }

    @Query(() => UploadMetrics)
    @UseGuards(GqlAuthGuard)
    async myUploadMetrics(@CurrentUser() user: User) {
        return this.filesService.getMetrics(user);
    }
}
