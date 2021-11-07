import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PolicyModule } from './policy/policy.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './policy/entities/policy.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOSTNAME,
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Policy],
      synchronize: true,
    }),
    PolicyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
