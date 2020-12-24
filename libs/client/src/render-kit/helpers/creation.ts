import { isArray, isNull } from "lodash";
import {
  RzElement, MetaProps, Component, isOfPrimitiveType, isCustomType,
  AbstractFactory, BasicComponent, CustomComponent, getRealType, callWithErrorPropagation
} from "../internal";
import { ComponentConstructor, RzRenderedNode, isRzElement } from "../models";

export const createComponent = (
  element: RzElement,
  factory: AbstractFactory,
  meta: MetaProps,
  parent: Component | undefined,
): Component => {

  if (!isRzElement(element)) {
    throw new TypeError('Invalid RzElement: ' + JSON.stringify(element));
  }

  if (typeof element.type === 'string') {
    let { type } = element;

    if (isOfPrimitiveType(element.type)) {
      const component = createPrimitiveComponent(element, factory, meta);

      const type = element.type;

      component.parent = parent;
      component.type = type;

      const children = element.children.map(child => {

        if (isRzElement(child)) {
          const comp = createComponent(child, factory, meta, component);
          comp.parent = component;
          return comp;
        }

        if (isArray(child)) {
          return child.map(nestedChild => {
            if (isRzElement(nestedChild)) {
              const comp = createComponent(nestedChild, factory, meta, component);
              comp.parent = component;
              return comp;
            }
            return nestedChild;
          })
        }

        if (isNull(child)) {
          return child;
        }

        throw new Error('Invalid child in component. ' + component + ': ' + child);
      });

      if (component.graphic) {
        component.graphic.component = component;
      }

      component._children = children;
      return component;


    } else {
      let realType = getRealType(factory, type);

      if (realType) {
        return createComponent({ ...element, type: realType }, factory, meta, parent);
      }
    }
  }

  if (isCustomType(element.type)) {

    const component = createCustomComponent(element, meta);
    component.type = element.type;
    component.parent = parent;

    const rendered = callWithErrorPropagation<RzRenderedNode>(parent, () => component.render());

    if (isNull(rendered)) {
      component._children = [null];
    }

    if (isRzElement(rendered)) {
      component._children = [createComponent(rendered, factory, meta, component)];
    }

    if (isArray(rendered)) {

      const children = element.children.map(child => {
        
        if (isRzElement(child)) {
          const comp = createComponent(child, factory, meta, component);
          comp.parent = component;
          return comp;
        }

        if (isArray(child)) {
          return child.map(nestedChild => {
            if (isRzElement(nestedChild)) {
              const comp = createComponent(nestedChild, factory, meta, component);
              comp.parent = component;
              return comp;
            }
            return nestedChild;
          })
        }
        
        return child;
      });

      component._children = children;
      return component;

    }

    throw new Error('Invalid render result from component. ' + component + ': ' + rendered);

  }

  throw new Error(`Unrecognized component: ${JSON.stringify(element)}`);
};

const createPrimitiveComponent = (element: RzElement, factory: AbstractFactory, meta: MetaProps): BasicComponent => {
  return factory.createComponent(element, meta);
};

const createCustomComponent = (element: RzElement, meta: MetaProps): CustomComponent => {
  const constructor = element.type as ComponentConstructor;
  const component = new constructor(element.props, meta);
  return component;
};