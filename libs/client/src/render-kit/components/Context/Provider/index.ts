import { WithSubscriptions, GenericSubscription, SubscribableBase } from "@app/shared";

import { CustomComponent } from "../../../internal";

type Props<T = any> = {
  value: T;
};

export interface ContextSubscription extends GenericSubscription { };

@WithSubscriptions
export class ContextProvider<T = {}> extends CustomComponent<Props<T>> implements SubscribableBase<T> {

  callbacks = new Set<(data: T) => void>();

  provideValueToSubscribers() {
    return this.props.value;
  }

  shouldUpdate(nextProps: Props) {
    return nextProps.value !== this.props.value;
  }

  willReceiveProps(nextProps: Props) {

    if (nextProps.value !== this.props.value) {
      this.callbacks.forEach((cb: (value: T) => void) => cb(nextProps.value));
    }

  }

  render() {
    return this.props.children;
  }
}