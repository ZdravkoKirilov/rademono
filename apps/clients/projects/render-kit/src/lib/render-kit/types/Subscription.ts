export type Callback<T = unknown> = (value: T) => void;

export interface SubscribableBase<T = unknown> {
  provideValueToSubscribers(): T;
  callbacks: Set<Callback<T>>;
}
