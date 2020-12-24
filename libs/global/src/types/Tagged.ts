export type Tagged<T extends string, U = {}> = {
  readonly __tag: T;
} & U;