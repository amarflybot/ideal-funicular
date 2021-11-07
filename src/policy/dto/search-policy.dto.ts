import { ApiProperty } from '@nestjs/swagger';

export class SearchPolicyDto {
  @ApiProperty()
  roleIds: string[];

  @ApiProperty()
  domain: string;
}
