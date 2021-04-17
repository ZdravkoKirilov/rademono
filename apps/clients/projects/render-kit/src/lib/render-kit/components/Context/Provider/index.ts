import { CustomComponent, SubscribableBase, Callback } from '../../../internal';

type Props<T = unknown> = {
  value: T;
};

export class ContextProvider<T = unknown>
  extends CustomComponent<Props<T>>
  implements SubscribableBase<T> {
  callbacks = new Set<Callback<T>>();

  provideValueToSubscribers() {
    return this.props.value;
  }

  shouldUpdate(nextProps: Props) {
    return nextProps.value !== this.props.value;
  }

  willReceiveProps(nextProps: Props) {
    if (nextProps.value !== this.props.value) {
      this.callbacks.forEach((cb: (value: T) => void) =>
        cb(nextProps.value as T),
      );
    }
  }

  subscribe = (callback: Callback<unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.callbacks.add(callback);

    callback(this.provideValueToSubscribers());

    return {
      unsubscribe() {
        self.callbacks.delete(callback);
      },
    };
  };

  render() {
    return this.props.children;
  }
}
