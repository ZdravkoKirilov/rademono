import { flatten } from "lodash";

import { RzElementPrimitiveProps, MetaProps, Component, RzSize, AbstractContainer, updateComponent } from "../internal";
import { PrimitiveType } from "../models";

export class BasicComponent<T extends Partial<RzElementPrimitiveProps> = {}> {
  static defaultProps = {};
  type: PrimitiveType;
  container: AbstractContainer;
  _children: Array<Component | null | Array<Component | null>> = [];
  parent?: Component;

  constructor(public props: T & Partial<RzElementPrimitiveProps>, public graphic: any, public meta: MetaProps) {
    this.props = { ...BasicComponent.defaultProps, ...(props as any) };
    this.meta.engine.event.assignEvents(this);
  }

  get children() {
    return flatten(this._children);
  }

  toString() {
    return `BasicComponent[${this.type}][${this.props.name}]`;
  }

  updateProps(newProps: T & RzElementPrimitiveProps) {
    const current = this.props || {};
    const next = { ...current, ...(newProps as any) } as T;

    if (this.shouldRerender(newProps)) {
      this.props = next;
      updateComponent(this, null);
    } else {
      this.props = next;
    }
  }

  update() {
    this.meta.engine.mutator.updateComponent(this);
    this.meta.engine.event.removeListeners(this);
    this.meta.engine.event.assignEvents(this);
  }

  getSize(): RzSize {
    return this.meta.engine.mutator.getSize(this);
  }

  remove() {
    this.meta.engine.mutator.removeComponent(this);
  }

  shouldRerender(nextProps: T): boolean {
    return nextProps !== this.props;
  }

}