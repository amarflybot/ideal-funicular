import { Test, TestingModule } from '@nestjs/testing';
import { PolicyService } from './policy.service';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PolicyRepository } from './policy.repository';

describe('PolicyService', () => {
  let service: PolicyService;
  let container: StartedTestContainer;
  let repository: PolicyRepository;

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
      providers: [PolicyService],
    }).compile();
    repository = module.get<PolicyRepository>(PolicyRepository);
    service = module.get<PolicyService>(PolicyService);
  });

  beforeEach(async () => {
    await repository.delete({});
  });
  afterAll(() => {
    container.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a policy', async () => {
    const policy = await service.createPolicy({
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
          await service.createPolicy({
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

    it('should find resources by roles and domain', async () => {
      await service.createPolicy({
        domain: 'prod',
        roleId: '123-123',
        resourceId: '1',
        tenancyId: 'acc1',
        actions: ['prod:read', 'prod:update'],
      });

      const resources = await service.findAllResourceByRolesAndDomain(
        ['123-123'],
        'prod',
      );
      expect(resources.length).toBe(3);
      expect(resources).toEqual([
        { resourceId: '1', tenancyId: 'acc1' },
        { resourceId: '11', tenancyId: 'acc2' },
        { resourceId: '12', tenancyId: 'acc1' },
      ]);

      const resourcesForProd1 = await service.findAllResourceByRolesAndDomain(
        ['123-123'],
        'prod1',
      );
      expect(resourcesForProd1.length).toBe(2);
      expect(resourcesForProd1).toEqual(
        expect.arrayContaining([
          { resourceId: '14', tenancyId: 'acc1' },
          { resourceId: '13', tenancyId: 'acc2' },
        ]),
      );

      const policiesForProd1ForRole345 =
        await service.findAllResourceByRolesAndDomain(['345'], 'prod1');
      expect(policiesForProd1ForRole345.length).toBe(0);
    });

    it('should get policyBy Id', async () => {
      const policy = await service.createPolicy({
        domain: 'prod',
        roleId: '123-123',
        resourceId: '1',
        tenancyId: 'acc1',
        actions: ['prod:read', 'prod:update'],
      });
      const policySaved = await service.findOne(policy.id);
      expect(policy).toEqual(policySaved);
    });

    it('should get actions which have [read,write] actions', async () => {
      const actions = await service.allowedActionsOnResource(
        ['123-123'],
        'prod',
        '12',
        ['prod:read', 'prod:write'],
      );
      expect(actions).toEqual(['prod:read', 'prod:write']);
    });

    it('should get no actions which does not have [read, update] actions', async () => {
      const actions = await service.allowedActionsOnResource(
        ['123-123'],
        'prod',
        '12',
        ['prod:read', 'prod:update'],
      );
      expect(actions.length).toBe(0);
    });

    it('should get no actions which does not have [update] actions', async () => {
      const actions = await service.allowedActionsOnResource(
        ['123-123'],
        'prod',
        '12',
        ['prod:update'],
      );
      expect(actions.length).toBe(0);
    });

    it('should get actions which has read permission', async () => {
      const actions = await service.allowedActionsOnResource(
        ['123-123'],
        'prod',
        '12',
        ['prod:read'],
      );
      expect(actions).toEqual(['prod:read', 'prod:write']);
    });
  });
});
