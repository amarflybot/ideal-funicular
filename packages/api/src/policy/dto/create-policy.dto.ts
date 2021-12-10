import { ApiProperty } from '@nestjs/swagger';

export class CreatePolicyDto {
  @ApiProperty()
  roleId: string;

  @ApiProperty()
  domain: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  tenancyId: string;

  @ApiProperty()
  actions: string[];
}
