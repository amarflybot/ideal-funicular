import { Injectable } from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { Policy } from './entities/policy.entity';
import { PolicyRepository } from './policy.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceDto } from './dto/resource.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(PolicyRepository)
    private policyRepository: PolicyRepository,
  ) {}

  createPolicy(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    return this.policyRepository.createPolicy(createPolicyDto);
  }

  async findAllResourceByRolesAndDomain(
    roleIds: string[],
    domain: string,
  ): Promise<ResourceDto[]> {
    const findAllPoliciesByRoleIdAndDomain =
      await this.policyRepository.findAllByRoleIdAndDomain(roleIds, domain);
    return findAllPoliciesByRoleIdAndDomain.map((policy) => {
      return new ResourceDto(policy.tenancyId, policy.resourceId);
    });
  }

  async allowedActionsOnResource(
    roleIds: string[],
    domain: string,
    resource: string,
    actions: string[],
  ): Promise<string[]> {
    const actionsOnResource =
      await this.policyRepository.findAllApplicablePolicies(
        roleIds,
        domain,
        resource,
        actions,
      );
    return actionsOnResource.reduce((acc, policy) => {
      policy.actions.map((action) => acc.push(action));
      return acc;
    }, []);
  }

  findOne(id: number) {
    return this.policyRepository.findOne(id);
  }

  update(id: number, updatePolicyDto: UpdatePolicyDto) {
    return `This action updates a #${id} policy`;
  }

  remove(id: number) {
    return `This action removes a #${id} policy`;
  }
}
