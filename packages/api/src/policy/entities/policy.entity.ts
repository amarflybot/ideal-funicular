import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'policy',
})
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_id',
  })
  roleId: string;

  @Column({
    name: 'domain',
  })
  domain: string;

  @Column({
    name: 'resource_id',
  })
  resourceId: string;

  @Column({
    name: 'tenancy_id',
  })
  tenancyId: string;

  @Column('simple-array')
  actions: string[];

  @CreateDateColumn({
    name: 'created_date',
  })
  createdDate: Date;

  @UpdateDateColumn({
    name: 'updated_date',
  })
  updatedDate: Date;
}
