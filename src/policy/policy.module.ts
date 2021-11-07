import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PolicyRepository } from './policy.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyRepository])],
  controllers: [PolicyController],
  providers: [PolicyService],
})
export class PolicyModule {}
