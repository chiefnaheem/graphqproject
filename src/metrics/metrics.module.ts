import { Module } from '@nestjs/common';
import { MetricsResolver } from './metrics.resolver';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [FilesModule],
    providers: [MetricsResolver],
})
export class MetricsModule { }
