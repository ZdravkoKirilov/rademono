export type Dictionary<T = any> = {
  [key: string]: T;
};

export type UnknownRecord = Record<PropertyKey, unknown>;
