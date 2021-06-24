import * as e from 'fp-ts/Either';

import { ParsingError, Url, UUIDv4 } from '../types';
import { breakTest, hasFieldError } from '../test';
import {
  Asset,
  AssetId,
  AssetType,
  CreateImageDto,
  PrivateAsset,
} from './Asset';
import { OrganizationId } from './Organization';

describe('Asset entity', () => {
  describe(Asset.name, () => {
    describe(Asset.createImage.name, () => {
      it('passes with correct data', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({ name: 'Some asset', file }).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toBeInstanceOf(CreateImageDto);
          done();
        });
      });

      it('fails with short name', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({ name: 'p', file }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'name')).toBe(true);
          done();
        });
      });

      it('fails with non-string name', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({ name: 5, file }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'name')).toBe(true);
          done();
        });
      });

      it('fails with long name', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({
          name: new Array(101).fill('a').join(''),
          file,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'name')).toBe(true);
          done();
        });
      });

      it('fails with missing name', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({
          file,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'name')).toBe(true);
          done();
        });
      });

      it('fails with short description', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({
          name: 'Some asset',
          description: 'kjh',
          file,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'description')).toBe(true);
          done();
        });
      });

      it('fails with long description', (done) => {
        const file = { name: 'picture.jpg', size: 0.5 * 1024 * 1024 };
        Asset.createImage({
          name: 'Some asset',
          description: new Array(501).fill('a').join('b'),
          file,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'description')).toBe(true);
          done();
        });
      });

      it('fails with unsupported file type', (done) => {
        const file = { name: 'picture.rar', size: 0.5 * 1024 * 1024 };
        Asset.createImage({
          name: 'Some asset',
          file,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'file')).toBe(true);
          done();
        });
      });

      it('fails with unsupported unsupported file size', (done) => {
        const file = { name: 'picture.rar', size: 5 * 1024 * 1024 };
        Asset.createImage({
          name: 'Some asset',
          file,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'file')).toBe(true);
          done();
        });
      });
    });
  });

  describe(PrivateAsset.name, () => {
    describe(PrivateAsset.createImage.name, () => {
      const data = {
        name: 'Some asset',
      };

      const organizationId = UUIDv4.generate<OrganizationId>();
      const assetId = UUIDv4.generate<AssetId>();
      const url = 'www.somecdn/picture.jpg' as Url;

      it('passes with correct data', (done) => {
        PrivateAsset.createImage(data, {
          organization: organizationId,
          fileUrl: url,
          createId: () => assetId,
        }).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }

          expect(res.right).toBeInstanceOf(PrivateAsset);
          expect(res.right).toEqual({
            ...data,
            url,
            organization: organizationId,
            public_id: assetId,
            type: AssetType.image,
          });

          done();
        });
      });

      it('fails with invalid url', (done) => {
        PrivateAsset.createImage(data, {
          organization: organizationId,
          fileUrl: 'not a valid url' as Url,
          createId: () => assetId,
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }

          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'url')).toBe(true);

          done();
        });
      });
    });

    describe(PrivateAsset.toPrivateEntity.name, () => {
      const data = {
        name: 'Some picture',
        url: 'www.somecdn/picture.jpg',
        public_id: UUIDv4.generate<AssetId>(),
        organization: UUIDv4.generate<OrganizationId>(),
        type: AssetType.image,
      };

      it('passes with correct data', (done) => {
        PrivateAsset.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }

          expect(res.right).toBeInstanceOf(PrivateAsset);
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('fails with invalid public_id', (done) => {
        PrivateAsset.toPrivateEntity({
          ...data,
          public_id: 'invalid',
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }

          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'public_id')).toBe(true);
          done();
        });
      });

      it('fails with invalid organizationId', (done) => {
        PrivateAsset.toPrivateEntity({
          ...data,
          organization: 'invalid',
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }

          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'organization')).toBe(true);
          done();
        });
      });

      it('fails with invalid type', (done) => {
        PrivateAsset.toPrivateEntity({
          ...data,
          type: 'invalid',
        }).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }

          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(hasFieldError(res.left, 'type')).toBe(true);
          done();
        });
      });
    });
  });
});
