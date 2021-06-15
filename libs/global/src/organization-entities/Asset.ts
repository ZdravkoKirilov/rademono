import { Expose } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { StringOfLength, Tagged, Url, UUIDv4 } from '../types';
import { OrganizationId } from './Organization';

enum AssetType {
  'image' = 'image',
  'audio' = 'audio',
}

export type AssetId = Tagged<'AssetId', UUIDv4>;

class BasicFields {
  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(AssetType))
  type: AssetType;

  @Expose()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: StringOfLength<2, 100>;
}

class CreateAssetDto {}

export class Asset {}

export class PrivateAsset extends BasicFields {
  @Expose()
  @IsUUID('4')
  public_id: AssetId;

  organization: OrganizationId;
  url: Url;

  static create() {}
}
