import { Expose } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import {
  AdminProfile,
  Organization,
  ProfileGroup,
} from '../organization-entities';

export class CreateOrganizationResponse {
  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  organization: Organization;

  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  group: ProfileGroup;

  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  profile: AdminProfile;
}
