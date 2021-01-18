export type Branded<K extends string> = {
  [P in K]: never;
};
