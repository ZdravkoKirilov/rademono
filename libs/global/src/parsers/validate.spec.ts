import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { isSome, isNone } from 'fp-ts/lib/Option';

import { ParsingError } from '../types';
import {
  parseAndValidateObject,
  parseAndValidateUnknown,
  parseToClass,
  validateObject,
} from './validate';

const throwError = () => {
  throw new Error('This code should not be called');
};

describe('parsers/validate', () => {
  class TestData {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsNumber()
    age: number;
  }

  describe('validateObject', () => {
    it('has no errors with correct data', (done) => {
      const instance = new TestData();
      instance.name = 'John';
      instance.age = 25;

      validateObject(instance).subscribe((errors) => {
        expect(errors.length).toBe(0);
        done();
      });
    });

    it('returns error with incorrect data', (done) => {
      const instance = new TestData();
      instance.age = 25;

      validateObject(instance).subscribe((errors) => {
        expect(errors.length).toBe(1);
        expect(errors[0].property).toEqual('name');
        done();
      });
    });
  });

  describe('parseToClass', () => {
    it('passes with correct data', (done) => {
      const plainData = { name: 'John', age: 25 };

      parseToClass(plainData, TestData).subscribe((result) => {
        if (isSome(result)) {
          expect(result.value).toBeInstanceOf(TestData);
          expect(result.value).toEqual({
            name: 'John',
            age: 25,
          });
        } else {
          throwError();
        }
        done();
      });
    });

    it('removes unknown fields', (done) => {
      const plainData = { name: 'John', age: 25, born: new Date() };

      parseToClass(plainData, TestData).subscribe((result) => {
        if (isSome(result)) {
          expect(result.value).toBeInstanceOf(TestData);
          expect(result.value).toEqual({
            name: 'John',
            age: 25,
          });
          done();
        } else {
          throwError();
        }
      });
    });

    it('returns None when input is not an object', (done) => {
      parseToClass(5, TestData).subscribe((result) => {
        expect(isNone(result)).toBe(true);
        done();
      });
    });
  });

  describe('parseAndValidateUnknown', () => {
    it('passes with valid data', (done) => {
      const validData = { name: 'Steven', age: 10 };

      parseAndValidateUnknown(validData, TestData).subscribe((result) => {
        if (isRight(result)) {
          expect(result.right).toBeInstanceOf(TestData);

          expect(result.right).toEqual({
            name: 'Steven',
            age: 10,
          });

          done();
        } else {
          throwError();
        }
      });
    });

    it('fails when payload is not an object', (done) => {
      parseAndValidateUnknown(undefined, TestData).subscribe((result) => {
        if (isLeft(result)) {
          expect(result.left).toBeInstanceOf(ParsingError);
          done();
        } else {
          throwError();
        }
      });
    });

    it('fails when there are invalid fields', (done) => {
      const invalidData = {
        name: 'Steven',
        age: new Date(),
      };

      parseAndValidateUnknown(invalidData, TestData).subscribe((result) => {
        if (isLeft(result)) {
          expect(result.left).toBeInstanceOf(ParsingError);
          done();
        } else {
          throwError();
        }
      });
    });
  });

  describe('parseAndValidateObject', () => {
    it('passes with valid data', (done) => {
      const validData = { name: 'Steven', age: 10 };

      parseAndValidateObject(validData, TestData).subscribe((result) => {
        if (isRight(result)) {
          expect(result.right).toBeInstanceOf(TestData);

          expect(result.right).toEqual({
            name: 'Steven',
            age: 10,
          });

          done();
        } else {
          throwError();
        }
      });
    });

    it('fails when there are invalid fields', (done) => {
      const invalidData = {
        name: 'Steven',
        age: new Date(),
      };

      parseAndValidateObject(invalidData, TestData).subscribe((result) => {
        if (isLeft(result)) {
          expect(result.left).toBeInstanceOf(ParsingError);
          done();
        } else {
          throwError();
        }
      });
    });
  });
});
