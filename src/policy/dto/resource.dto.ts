export class ResourceDto {
  tenancyId: string;
  resourceId: string;

  constructor(tenancyId: string, resourceId: string) {
    this.tenancyId = tenancyId;
    this.resourceId = resourceId;
  }
}
