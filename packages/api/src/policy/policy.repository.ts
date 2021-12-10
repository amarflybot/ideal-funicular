import { EntityRepository, In, Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(Policy)
export class PolicyRepository extends Repository<Policy> {
  createPolicy(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const policy = this.create(createPolicyDto);
    return this.save(policy);
  }

  findAllByRoleIdAndDomain(
    roleIds: string[],
    domain: string,
  ): Promise<Policy[]> {
    return this.find({
      where: {
        domain: domain,
        roleId: In(roleIds),
      },
      order: {
        updatedDate: 'DESC',
      },
    });
  }

  findAllApplicablePolicies(
    roleIds: string[],
    domain: string,
    resource: string,
    actions: string[],
  ): Promise<Policy[]> {
    return this.createQueryBuilder('policy')
      .where('policy.role_id IN(:...ids)', { ids: roleIds })
      .andWhere('policy.domain = :domain', { domain: domain })
      .andWhere('policy.resource_id = :resource', { resource: resource })
      .andWhere('policy.actions like :id', { id: actions + '%' })
      .getMany();
  }
}
