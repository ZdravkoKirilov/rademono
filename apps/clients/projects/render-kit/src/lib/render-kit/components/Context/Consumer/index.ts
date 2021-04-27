import { isFunction } from 'lodash';

import { GenericSubscription } from '@end/global';

import {
  CustomComponent,
  MetaProps,
  RzElement,
  ComponentConstructor,
  findContextProvider,
} from '../../../internal';
import { ContextProvider } from '../Provider';

type RenderCallback<T> = (data: T) => RzElement;

type ContextConsumerProps<T = unknown> = {
  value: T;
  render: RenderCallback<T>;
  parentName?: string;
};

type State<T = unknown> = { value: T };

export class ContextConsumer<T = unknown> extends CustomComponent<
  ContextConsumerProps<T>
> {
  state: State = {} as State;
  key: ComponentConstructor;
  sub: GenericSubscription;

  constructor(props: ContextConsumerProps<T>, meta: MetaProps) {
    super(props, meta);
  }

  shouldRerender() {
    return true;
  }

  didMount() {
    const providerContext = findContextProvider(
      this,
      this.props.parentName,
      this.key,
    ) as ContextProvider<T>;

    if (providerContext && isFunction(providerContext.subscribe)) {
      providerContext.subscribe((newValue) =>
        this.setState({ value: newValue }),
      );
    } else {
      throw new Error(
        'ContextConsumer couldn`t find corresponding ContextProvider: ParentName: ' +
          this.props.parentName +
          '; Key:  ' +
          this.key,
      );
    }
  }

  willUnmount() {
    this.sub && this.sub.unsubscribe();
  }

  render() {
    return this.state.value ? this.props.render(this.state.value as T) : null;
  }
}