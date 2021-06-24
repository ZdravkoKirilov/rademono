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
import { StringOfLength, Tagged, Url, UUIDv4, CustomFile } from '../types';
import { OrganizationId } from './Organization';

export enum AssetType {
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
  @MinLength(5)
  @MaxLength(500)
  description?: StringOfLength<5, 500>;
}

class AdvancedFields extends BasicFields {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  organization: OrganizationId;

  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(AssetType))
  type: AssetType;

  @Expose()
  @IsNotEmpty()
  @IsUrl()
  url: Url;
}

export class CreateImageDto extends BasicFields {
  @Expose()
  @CustomFile.IsFile()
  @CustomFile.FileType({ types: ['jpg', 'png', 'jpeg'] })
  @CustomFile.FileSize({ maxSizeMB: 1 })
  file: CustomFile;
}

export class Asset extends AdvancedFields {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  id: AssetId;

  static createImage(payload: unknown) {
    return parseAndValidateUnknown(payload, CreateImageDto);
  }
}

export class PrivateAsset extends AdvancedFields {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  public_id: AssetId;

  static createImage(
    payload: unknown,
    {
      organization,
      fileUrl,
      createId,
    }: { organization: OrganizationId; fileUrl: Url; createId: () => AssetId },
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
            public_id: createId(),
          },
          PrivateAsset,
        );
      }),
    );
  }
}
