import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { isSome, isNone } from 'fp-ts/lib/Option';

import { MalformedPayloadError, ParsingError } from '../types';
import { parseAndValidateObject, parseAndValidateUnknown, parseToClass, validateObject } from "./validate";

const throwError = () => {
  throwError()
};

describe("parsers/validate", () => {

  class TestData {

    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsNumber()
    age: number;
  };

  describe("validateObject", () => {

    it("has no errors with correct data", async () => {

      const instance = new TestData();
      instance.name = 'John';
      instance.age = 25;

      const errors = await validateObject(instance).toPromise();
      expect(errors.length).toBe(0);

    });

    it("returns error with incorrect data", async () => {

      const instance = new TestData();
      instance.age = 25;

      const errors = await validateObject(instance).toPromise();
      expect(errors.length).toBe(1);
      expect(errors[0].property).toEqual('name');

    });

  });

  describe("parseToClass", () => {

    it("passes with correct data", async () => {
      const plainData = { name: "John", age: 25 };

      const result = await parseToClass(plainData, TestData).toPromise();

      if (isSome(result)) {
        expect(result.value).toBeInstanceOf(TestData);
        expect(result.value).toEqual({
          name: 'John',
          age: 25,
        })
      } else {
        throwError();
      }
    });

    it("removes unknown fields", async () => {
      const plainData = { name: "John", age: 25, born: new Date() };

      const result = await parseToClass(plainData, TestData).toPromise();

      if (isSome(result)) {
        expect(result.value).toBeInstanceOf(TestData);
        expect(result.value).toEqual({
          name: 'John',
          age: 25
        })
      } else {
        throwError();
      }
    });

    it("returns None when input is not an object", async () => {

      const primitiveValue = await parseToClass(5, TestData).toPromise();
      expect(isNone(primitiveValue)).toBe(true);

      const nullValue = await parseToClass(null, TestData).toPromise();
      expect(isNone(nullValue)).toBe(true);

    });

  });

  describe("parseAndValidateUnknown", () => {

    it("passes with valid data", async () => {
      const validData = { name: 'Steven', age: 10 };

      const result = await parseAndValidateUnknown(validData, TestData).toPromise();

      if (isRight(result)) {

        expect(result.right).toBeInstanceOf(TestData);

        expect(result.right).toEqual({
          name: 'Steven',
          age: 10
        });

      } else {
        throwError();
      }
    });

    it("fails when payload is not an object", async () => {

      const result = await parseAndValidateUnknown(undefined, TestData).toPromise();

      if (isLeft(result)) {

        expect(result.left).toBeInstanceOf(MalformedPayloadError);

      } else {
        throwError();
      }
    });

    it("fails when there are invalid fields", async () => {

      const invalidData = {
        name: 'Steven',
        age: new Date(),
      };

      const result = await parseAndValidateUnknown(invalidData, TestData).toPromise();

      if (isLeft(result)) {

        expect(result.left).toBeInstanceOf(ParsingError);
      } else {
        throwError();
      }
    });


  });

  describe("parseAndValidateObject", () => {

    it("passes with valid data", async () => {
      const validData = { name: 'Steven', age: 10 };

      const result = await parseAndValidateObject(validData, TestData).toPromise();

      if (isRight(result)) {

        expect(result.right).toBeInstanceOf(TestData);

        expect(result.right).toEqual({
          name: 'Steven',
          age: 10
        });

      } else {
        throwError();
      }
    });

    it("fails when there are invalid fields", async () => {

      const invalidData = {
        name: 'Steven',
        age: new Date(),
      };

      const result = await parseAndValidateObject(invalidData, TestData).toPromise();

      if (isLeft(result)) {

        expect(result.left).toBeInstanceOf(ParsingError);
      } else {
        throwError();
      }
    });


  });

});