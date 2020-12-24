import { ContextProvider } from "./Provider";
import { ContextConsumer } from "./Consumer";

export const createContext = <T = any>() => {
  const provider = class extends ContextProvider<T> { };
  const consumer = class extends ContextConsumer<T> { };
  consumer.prototype.key = provider as any;

  return {
    Provider: provider,
    Consumer: consumer
  };
};

export * from './Provider';
export * from './Consumer';

export * from './helpers';