export type Never<K extends string> = {
  [P in K]: never;
};
