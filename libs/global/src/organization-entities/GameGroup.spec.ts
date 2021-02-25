import * as e from 'fp-ts/lib/Either';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { GameGroupId, PrivateGameGroup } from './GameGroup';

describe('GameGroup entity', () => {
  describe(PrivateGameGroup.name, () => {
    describe(PrivateGameGroup.create.name, () => {
      it('passes with enough data', (done) => {
        const public_id = UUIDv4.generate<GameGroupId>();
        const createId = () => public_id;

        const data = {
          name: 'Name',
          organization: UUIDv4.generate(),
          games: [UUIDv4.generate()],
        };

        PrivateGameGroup.create(data, createId).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual({ ...data, public_id });
          done();
        });
      });

      it('fails with missing name', (done) => {
        const public_id = UUIDv4.generate<GameGroupId>();
        const createId = () => public_id;

        const data = {
          organization: UUIDv4.generate(),
          games: [UUIDv4.generate()],
          description: 'desc',
        };

        PrivateGameGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails with invalid name', (done) => {
        const public_id = UUIDv4.generate<GameGroupId>();
        const createId = () => public_id;

        const data = {
          organization: UUIDv4.generate(),
          games: [UUIDv4.generate()],
          description: 'desc',
          name: new Array(102).fill('l'),
        };

        PrivateGameGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails with invalid description', (done) => {
        const public_id = UUIDv4.generate<GameGroupId>();
        const createId = () => public_id;

        const data = {
          organization: UUIDv4.generate(),
          games: [UUIDv4.generate()],
          description: new Array(1000).fill('abcde'),
          name: 'name',
        };

        PrivateGameGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('description');
          done();
        });
      });

      it('fails with missing games', (done) => {
        const public_id = UUIDv4.generate<GameGroupId>();
        const createId = () => public_id;

        const data = {
          organization: UUIDv4.generate(),
          name: 'name',
        };

        PrivateGameGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('games');
          done();
        });
      });

      it('fails with invalid games', (done) => {
        const public_id = UUIDv4.generate<GameGroupId>();
        const createId = () => public_id;

        const data = {
          organization: UUIDv4.generate(),
          name: 'name',
          games: [1, 2, UUIDv4.generate()],
        };

        PrivateGameGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('games');
          done();
        });
      });
    });
  });
});
