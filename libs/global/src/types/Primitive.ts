type ToPrimitive<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T;

export type Primitive<O> = {
  [K in keyof O]: ToPrimitive<O[K]>;
};
