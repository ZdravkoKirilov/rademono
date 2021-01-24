import { Observable } from 'rxjs';
import * as e from 'fp-ts/lib/Either';
import { map } from 'rxjs/operators';

import {
  ExpressionContext,
  MalformedPayloadError,
  ParsingError,
  UUIDv4,
} from '../types';
import { ParamedExpressionFunc } from './Expression.model';
import { ModuleId } from './Module.model';
import { CoreStyles } from './Style.model';
import { ModularEntity } from './types';
import {
  ClassType,
  parseAndValidateObject,
  parseAndValidateUnknown,
  transformToClass,
  transformToPlain,
} from '../parsers';

export type BaseModel<T = ModularEntity['id']> = {
  id: T;

  name: string;
  description: string;
  module: ModuleId;
};

export type WithStyle = {
  style: string; // Expression -> Style
  style_inline: CoreStyles;
};

export type WithRuntimeStyle<T = any> = {
  style_inline: CoreStyles;
  style: ParamedExpressionFunc<T, CoreStyles>;
};

export type GameEntityParser<Entity, DtoEntity, RuntimeEntity> = {
  toRuntime: (
    context: ExpressionContext,
    entity: Entity,
    ...args: any[]
  ) => RuntimeEntity;
  toDto: (entity: Entity) => DtoEntity;
  toEntity: (dtoEntity: DtoEntity) => Entity;

  fromUnknown: {
    toEntity: (input: unknown) => Entity;
  };
};

type AbstractEntity<
  Id,
  Entity,
  CreateDto,
  UpdateDto,
  ReadDto,
  NewInstance,
  FullInstance
> = {
  toPrimaryId: (input: unknown) => Id;

  /* FE before send, BE on receive */
  toCreateDto: (
    input: unknown,
  ) => Observable<e.Either<ParsingError | MalformedPayloadError, CreateDto>>;
  toUpdateDto: (
    input: unknown,
  ) => Observable<e.Either<ParsingError | MalformedPayloadError, UpdateDto>>;

  /* FE: validation combined with the above DTO; BE - same */
  create: (
    input: CreateDto,
    createId?: () => UUIDv4,
  ) => Observable<e.Either<ParsingError, NewInstance>>;
  update: (
    entity: Entity,
    input: UpdateDto,
  ) => Observable<e.Either<ParsingError, FullInstance>>;

  /* FE on receive */
  toEntity: (input: ReadDto) => Entity;

  // BE before response to FE
  toReadDto: (input: FullInstance) => ReadDto;
  // BE Repo after read from DB
  toFullEntity: (
    input: unknown,
  ) => Observable<e.Either<ParsingError, FullInstance>>;
};

export const createAbstractEntityParser = <Id extends UUIDv4>() => <
  Entity,
  CreateDto,
  UpdateDto,
  ReadDto,
  NewInstance,
  FullInstance
>({
  entityType,
  createDtoType,
  updateDtoType,
  readDtoType,
  newInstanceType,
  fullInstanceType,
}: {
  entityType: ClassType<Entity>;
  createDtoType: ClassType<CreateDto>;
  updateDtoType: ClassType<UpdateDto>;
  readDtoType: ClassType<ReadDto>;
  newInstanceType: ClassType<NewInstance>;
  fullInstanceType: ClassType<FullInstance>;
}): AbstractEntity<
  Id,
  Entity,
  CreateDto,
  UpdateDto,
  ReadDto,
  NewInstance,
  FullInstance
> => ({
  toPrimaryId: (input) => {
    return input as Id;
  },

  toCreateDto(input) {
    return parseAndValidateUnknown(input, createDtoType);
  },

  toUpdateDto(input) {
    return parseAndValidateUnknown(input, updateDtoType);
  },

  toReadDto(input) {
    return transformToClass(readDtoType, transformToPlain(input));
  },

  toEntity(input) {
    return transformToClass(entityType, input);
  },

  toFullEntity(input) {
    return parseAndValidateObject(input, fullInstanceType);
  },

  create(input, createId = UUIDv4.generate) {
    return parseAndValidateObject(input, newInstanceType).pipe(
      map((result) => {
        if (e.isRight(result)) {
          return e.right({
            ...result.right,
            public_id: createId(),
          });
        }
        return result;
      }),
    );
  },

  update(entity, input) {
    return parseAndValidateObject(
      { ...entity, ...input },
      fullInstanceType,
    ).pipe(
      map((result) => {
        if (e.isRight(result)) {
          return e.right({ ...entity, ...result.right });
        }
        return result;
      }),
    );
  },
});
