import { flatten, get } from "lodash";
import { CustomProps } from "../helpers";

import {
  RzElementProps, MetaProps, updateComponent,
  DidUpdatePayload, Component, AbstractContainer, RzRenderedNode, IntrinsicProps
} from "../internal";

export class CustomComponent<P extends IntrinsicProps & CustomProps = {}, S = {}> {
  static readonly __custom_component__ = true;
  static defaultProps: Partial<RzElementProps>;

  meta: MetaProps;

  state: S;
  props: P & RzElementProps;

  type: CustomComponent;

  container: AbstractContainer;
  _children: Array<Component | null | Array<Component | null>> = [];
  parent?: Component;

  constructor(props: P, meta: MetaProps) {
    this.props = { ...get(this, 'constructor.defaultProps', {}), ...props };
    this.meta = meta;
  }

  get children() {
    return flatten(this._children);
  }

  toString() {
    return `CustomComponent[${get(this, 'constructor.name')}][${this.props.name}]`;
  }

  setState(state: Partial<S>, callback?: Function) {

    const current = this.state as any || {} as any;
    const next = { ...current, ...(state as any) || {} } as S;
    if (this.shouldRerender(this.props, next)) {
      this.state = next as S;
      setTimeout(() => {
        updateComponent(this, this.render() as any);
        if (callback) {
          callback();
        }
        if (this.didUpdate) {
          this.didUpdate({
            prev: { state: current, props: this.props },
            next: { state: next, props: this.props },
          });
        }
      });
    } else {
      this.state = next as S;
      if (callback) {
        callback();
      }
    }
  }

  updateProps(props: Partial<P>, callback?: Function) {
    setTimeout(() => {
      const current = this.props || {} as P;
      const next = { ...(current as any), ...(props as any) } as P;

      if (this.shouldRerender(next, this.state)) {
        if (this.willReceiveProps) {
          this.willReceiveProps(next);
        }
        this.props = next as P & RzElementProps;
        updateComponent(this, this.render() as any);
        if (callback) {
          callback();
        }
        if (this.didUpdate) {
          this.didUpdate({
            prev: { state: this.state, props: current },
            next: { state: this.state, props: next },
          });
        }
      } else {
        this.props = next as P & RzElementProps;
        if (callback) {
          callback();
        }
      }
    });
  }

  shouldRerender(nextProps: P, nextState: S) {
    return nextProps !== this.props || nextState !== this.state;
  }

  render(): RzRenderedNode {
    throw new Error('"render()" must be implemented in CustomComponents');
  };

  willReceiveProps?(nextProps: P): void;
  willMount?(): void;
  didMount?(): void;
  willUnmount?(): void;
  didUpdate?(payload: DidUpdatePayload<P, S>): void;

  didCatch?(err: any, stack: string): void;
}