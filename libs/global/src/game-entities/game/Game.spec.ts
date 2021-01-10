import { isLeft, isRight } from "fp-ts/lib/Either";

import { MalformedPayloadError, ParsingError, UUIDv4 } from "../../types";
import { FullGame, GameId, GameParser } from "./Game";

const throwError = () => {
  throw new Error('This code should not be called');
};

describe("Game Entity", () => {

  describe("createDto", () => {

    const data = {
      title: 'Game 1',
      description: 'Description',
      image: 'https://www.abv.bg'
    };

    it('passes with correct data', async () => {

      const result = await GameParser.toCreateDto(data).toPromise();

      if (isRight(result)) {

        expect(result.right).toEqual(data);

      } else {
        throwError();
      }
    });

    it('fails when input is not an object', async () => {

      const result = await GameParser.toCreateDto(undefined).toPromise();

      if (isRight(result)) {

        throwError();

      } else {

        expect(result.left).toBeInstanceOf(MalformedPayloadError);
      }
    });

    it('passes with title only', async () => {

      const result = await GameParser.toCreateDto({ title: 'Game 1' }).toPromise();

      if (isLeft(result)) {

        throwError();

      } else {

        expect(result.right).toEqual({ title: 'Game 1' });
      }
    });

    it('fails without title', async () => {

      const result = await GameParser.toCreateDto({ description: 'Game 1', image: 'http://abv.bg' }).toPromise();

      if (isRight(result)) {

        throwError();

      } else {

        expect(result.left).toBeInstanceOf(ParsingError);
      }
    });

    it('removes extra props', async () => {

      const result = await GameParser.toCreateDto({ ...data, extra: 'extra' }).toPromise();

      if (isLeft(result)) {

        throwError();

      } else {

        expect(result.right).toEqual(data);
      }
    });


  });

  describe("updateDto", () => {

    const data = {
      id: "1",
      title: 'Game 1',
      description: 'Description',
      image: 'https://www.abv.bg'
    };

    it('passes with correct data', async () => {

      const result = await GameParser.toUpdateDto(data).toPromise();

      if (isRight(result)) {

        expect(result.right).toEqual(data);

      } else {
        throwError();
      }
    });

    it('fails when input is not an object', async () => {

      const result = await GameParser.toUpdateDto(undefined).toPromise();

      if (isRight(result)) {

        throwError();

      } else {

        expect(result.left).toBeInstanceOf(MalformedPayloadError);
      }
    });

    it('removes extra props', async () => {

      const result = await GameParser.toUpdateDto({ ...data, extra: 'extra' }).toPromise();

      if (isLeft(result)) {

        throwError();

      } else {

        expect(result.right).toEqual(data);
      }
    });


  });

  describe("create", () => {
    const publicId = UUIDv4.generate();

    const data = {
      title: 'Game 1',
      description: 'Game 1 description',
      image: 'http://www.abv.bg',
    };

    const createId = () => publicId;

    it('passes with correct data', async () => {

      const result = await GameParser.create(data, createId).toPromise();

      if (isLeft(result)) {
        throwError();
      } else {

        expect(result.right).toEqual({ ...data, public_id: publicId });
      }

    });

    it("fails with an empty payload", async () => {

      const result = await GameParser.create({} as any).toPromise();

      if (isRight(result)) {
        throwError();
      } else {
        expect(result.left).toBeInstanceOf(ParsingError);
      }
    });

    it("succeeds with a title only ", async () => {

      const result = await GameParser.create({ title: 'New Game' }, createId).toPromise();

      if (isLeft(result)) {
        throwError();
      } else {
        expect(result.right).toEqual({ title: 'New Game', public_id: publicId });
      }
    });

    it("fails if Image is not a valid url", async () => {
      const result = await GameParser.create({ title: 'New Game', image: 'notAUrl' }).toPromise();

      if (isRight(result)) {
        throwError();
      } else {
        expect(result.left).toBeInstanceOf(ParsingError);
        expect(result.left.errors[0].property).toEqual('image');
      }
    });

  });

  describe("update", () => {
    const publicId = UUIDv4.generate();

    const entity = {
      title: 'Game 1',
      description: 'Game 1 description',
      image: 'http://www.abv.bg',
      public_id: publicId,
    } as any;

    const updatedData = {
      title: 'Game 2',
      id: publicId,
    };

    it('passes with correct data', async () => {

      const result = await GameParser.update(entity, updatedData).toPromise();

      if (isLeft(result)) {
        throwError();
      } else {

        expect(result.right).toEqual({ ...entity, title: 'Game 2', public_id: publicId });
      }

    });

    it("fails with an empty payload", async () => {

      const result = await GameParser.update({} as any, {} as any).toPromise();

      if (isRight(result)) {
        throwError();
      } else {
        expect(result.left).toBeInstanceOf(ParsingError);
      }
    });

    it("fails if Image is not a valid url", async () => {
      const result = await GameParser.update(entity, { image: 'notAUrl', id: publicId }).toPromise();

      if (isRight(result)) {
        throwError();
      } else {
        expect(result.left).toBeInstanceOf(ParsingError);
        expect(result.left.errors[0].property).toEqual('image');
      }
    });

  });

});