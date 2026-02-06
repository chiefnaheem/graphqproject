import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { MetricsModule } from './metrics/metrics.module';
import { join } from 'path';
import { configValidationSchema } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { GraphQLError } from 'graphql';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // Production ready
      }),
    }),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   sortSchema: true,
    //   subscriptions: {
    //     'graphql-ws': {
    //       path: '/graphql',
    //       onConnect: (context: any) => {
    //         const { connectionParams, extra } = context;
    //         if (connectionParams && connectionParams.Authorization) {
    //           extra.headers = { authorization: connectionParams.Authorization };
    //         }
    //       },
    //     },
    //   },
    //   context: ({ req, extra }) => {
    //     if (extra && extra.headers) {
    //       return { req: { headers: extra.headers } };
    //     }
    //     return { req };
    //   },
    //   playground: true,
    // }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: false,
      introspection: true,
      context: ({ req, res, extra }) => {
        // Handle subscriptions (where req is undefined)
        if (extra && extra.headers) {
          return { req: { headers: extra.headers } };
        }
        // Handle standard HTTP requests
        return { req, res };
      },
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
          onConnect: (context: any) => {
            const { connectionParams, extra } = context;
            // Handle Authorization header (case-insensitive)
            const authToken = connectionParams?.Authorization || connectionParams?.authorization;
            if (authToken) {
              extra.headers = { authorization: authToken };
            }
          },
        },
      },
      plugins: [
        // process.env.NODE_ENV === EnvType.DEVELOP
        ApolloServerPluginLandingPageLocalDefault()
        // : ApolloServerPluginLandingPageProductionDefault(),
      ],
      formatError: (error: GraphQLError) => {
        // Split the message by semicolon
        const errorMessage = error.message.split(";");

        // Extract the message after the last semicolon
        const getMessage = errorMessage[errorMessage.length - 1].trim();

        // Remove the escaped quotes from the message
        const cleanMessage = getMessage.replace(/\"/g, "");

        return {
          status: error.extensions?.code,
          message: cleanMessage,
        };
      },
    }),
    UsersModule,
    AuthModule,
    FilesModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
