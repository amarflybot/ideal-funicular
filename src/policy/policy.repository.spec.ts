import { Test, TestingModule } from '@nestjs/testing';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PolicyRepository } from './policy.repository';

describe('PolicyRepository', () => {
  let repository: PolicyRepository;
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await new GenericContainer('postgres')
      .withExposedPorts(5432)
      .withEnv('POSTGRES_USER', 'postgres')
      .withEnv('POSTGRES_PASSWORD', 'changeme')
      .start();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getMappedPort(5432),
          username: 'postgres',
          password: 'changeme',
          database: 'postgres',
          entities: [Policy],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([PolicyRepository]),
      ],
    }).compile();
    repository = module.get<PolicyRepository>(PolicyRepository);
  });

  beforeEach(async () => {
    await repository.delete({});
  });
  afterAll(() => {
    container.stop();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create a policy', async () => {
    const policy = await repository.createPolicy({
      domain: 'prod',
      roleId: '123-123',
      resourceId: '12',
      tenancyId: 'acc1',
      actions: ['prod:read', 'prod:update'],
    });
    expect(policy).toBeDefined();
    expect(policy.roleId).toBe('123-123');
  });

  describe('all searches', () => {
    beforeEach(async () => {
      await Promise.all(
        [
          {
            domain: 'prod',
            resource: '12',
            roleId: '123-123',
            tenancyId: 'acc1',
            actions: ['prod:read', 'prod:write'],
          },
          {
            domain: 'prod1',
            resource: '13',
            roleId: '123-123',
            tenancyId: 'acc2',
            actions: ['prod:read', 'prod:update'],
          },
          {
            domain: 'prod1',
            resource: '14',
            roleId: '123-123',
            tenancyId: 'acc1',
            actions: ['prod:read', 'prod:update'],
          },
          {
            domain: 'prod',
            resource: '11',
            roleId: '123-123',
            tenancyId: 'acc2',
            actions: ['prod:read', 'prod:update'],
          },
          {
            domain: 'prod',
            resource: '10',
            roleId: '345',
            tenancyId: 'acc1',
            actions: ['prod:read', 'prod:update'],
          },
          {
            domain: 'prod',
            resource: '20',
            roleId: '345',
            tenancyId: 'acc3',
            actions: ['prod:read', 'prod:update'],
          },
        ].map(async (value) => {
          await repository.createPolicy({
            domain: value.domain,
            roleId: value.roleId,
            resourceId: value.resource,
            tenancyId: value.tenancyId,
            actions: value.actions,
          });
        }),
      );
    });

    afterEach(async () => {
      await repository.delete({});
    });

    it('should find policies by roles and domain', async () => {
      await repository.createPolicy({
        domain: 'prod',
        roleId: '123-123',
        resourceId: '1',
        tenancyId: 'acc1',
        actions: ['prod:read', 'prod:update'],
      });

      const policies = await repository.findAllByRoleIdAndDomain(
        ['123-123'],
        'prod',
      );
      expect(policies.length).toBe(3);
      expect(policies[0].resourceId).toBe('1');

      const policiesForProd1 = await repository.findAllByRoleIdAndDomain(
        ['123-123'],
        'prod1',
      );
      expect(policiesForProd1.length).toBe(2);

      const policiesForProd1ForRole345 =
        await repository.findAllByRoleIdAndDomain(['345'], 'prod1');
      expect(policiesForProd1ForRole345.length).toBe(0);
    });

    it('should get policyBy Id', async () => {
      const policy = await repository.createPolicy({
        domain: 'prod',
        roleId: '123-123',
        resourceId: '1',
        tenancyId: 'acc1',
        actions: ['prod:read', 'prod:update'],
      });
      const policySaved = await repository.findOne(policy.id);
      expect(policy).toEqual(policySaved);
    });

    it('should get Policies which have [read,write] actions', async () => {
      const policies = await repository.findAllApplicablePolicies(
        ['123-123'],
        'prod',
        '12',
        ['prod:read', 'prod:write'],
      );
      expect(policies.length).toBe(1);
    });

    it('should get no Policies which does not have [read, update] actions', async () => {
      const policies = await repository.findAllApplicablePolicies(
        ['123-123'],
        'prod',
        '12',
        ['prod:read', 'prod:update'],
      );
      expect(policies.length).toBe(0);
    });

    it('should get no Policies which does not have [update] actions', async () => {
      const policies = await repository.findAllApplicablePolicies(
        ['123-123'],
        'prod',
        '12',
        ['prod:update'],
      );
      expect(policies.length).toBe(0);
    });

    it('should get a Policy which has read permission', async () => {
      const policies = await repository.findAllApplicablePolicies(
        ['123-123'],
        'prod',
        '12',
        ['prod:read'],
      );
      expect(policies.length).toBe(1);
    });
  });
});
