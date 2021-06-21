import { Expose } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/Either';

import { parseAndValidateUnknown, toLeftObs } from '../parsers';
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
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: StringOfLength<2, 100>;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  label?: StringOfLength<2, 500>;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  description?: StringOfLength<2, 500>;
}

class AdvancedFields extends BasicFields {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  organization: OrganizationId;

  @Expose()
  @IsNotEmpty()
  @IsUrl()
  url: Url;
}

export class CreateImageDto extends AdvancedFields {
  @Expose()
  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(AssetType))
  type: AssetType.image;
}

export class Asset {}

export class PrivateAsset extends AdvancedFields {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  public_id: AssetId;

  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(AssetType))
  type: AssetType;

  static createImage(
    payload: unknown,
    organization: OrganizationId,
    fileUrl: Url,
  ) {
    return parseAndValidateUnknown(payload, BasicFields).pipe(
      switchMap((parsed) => {
        if (e.isLeft(parsed)) {
          return toLeftObs(parsed.left);
        }
        return parseAndValidateUnknown(
          {
            ...parsed.right,
            type: AssetType.image,
            url: fileUrl,
            organization,
          },
          CreateImageDto,
        );
      }),
    );
  }
}
