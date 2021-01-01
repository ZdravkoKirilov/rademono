import { Tagged } from "./Tagged";

export const MustBeAstring = 'MustBeAString';
export const CannotBeEmpty = 'CannotBeEmpty';
export const PayloadIsNotAnObject = 'PayloadIsNotAnObject';
export const InvalidPayload = 'InvalidPayload';
export const CorruptedData = 'CorruptedData';

export type MustBeAstring = typeof MustBeAstring;
export type CannotBeEmpty = typeof CannotBeEmpty;
export type PayloadIsNotAnObject = typeof PayloadIsNotAnObject;
export type InvalidPayload = typeof InvalidPayload;

export type ParsingError<Message, Errors> = Tagged<typeof InvalidPayload | typeof PayloadIsNotAnObject, {
  message?: Message;
  errors?: Partial<Errors>;
}>;

export type CorruptedDataError = Tagged<typeof CorruptedData, {
  type: string;
  id: string;
}>;