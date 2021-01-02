import { Tagged } from "./Tagged";

export const PayloadIsNotAnObject = 'PayloadIsNotAnObject';
export const InvalidPayload = 'InvalidPayload';
export const CorruptedData = 'CorruptedData';

export type PayloadIsNotAnObject = typeof PayloadIsNotAnObject;
export type InvalidPayload = typeof InvalidPayload;

export type ParsingError<Message, Errors> = Tagged<typeof InvalidPayload | typeof PayloadIsNotAnObject, {
  message?: Message;
  errors?: Partial<Errors>;
}>;

export const toParsingError = <Message, Errors = {}>(
  tag: InvalidPayload | PayloadIsNotAnObject,
  message?: Message,
  errors?: Errors,
): ParsingError<Message, Errors> => ({
  __tag: tag,
  message, errors
} as const)

export type CorruptedDataError = Tagged<typeof CorruptedData, {
  type: string;
  id: string;
}>;