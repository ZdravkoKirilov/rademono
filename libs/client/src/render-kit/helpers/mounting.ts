import { get, isFunction, set } from 'lodash';

import {
  Component,
  AbstractContainer,
  CustomComponent,
  BasicComponent,
  PRIMS,
  isCustomComponent,
  isPrimitiveComponent,
  callWithErrorPropagation,
} from '../internal';

export const unmountComponent = (component: Component) => {
  if (component && get(component, '__mounted__') === true) {
    console.debug('unmount component: ', component);

    if (isCustomComponent(component)) {
      unmountCustomComponent(component);
    }
    if (isPrimitiveComponent(component)) {
      unmountPrimitiveComponent(component);
    }
    set(component, '__mounted__', false);
  }
};

export const unmountCustomComponent = (component: CustomComponent) => {
  if (isFunction(component.willUnmount)) {
    component.willUnmount();
  }

  unmountChildren(component);
};

export const unmountChildren = (component: CustomComponent) => {
  component.children.forEach((child) => {
    if (child) {
      unmountComponent(child);
    }
  });
};

export const unmountPrimitiveComponent = (component: BasicComponent) => {
  component.remove();
};

export const mountComponent = (
  component: Component,
  container: AbstractContainer,
): Component => {
  console.log('Mounting: ', component);

  if (isCustomComponent(component)) {
    set(component, '__mounted__', true);
    return mountCustomComponent(component, container);
  }
  if (isPrimitiveComponent(component)) {
    set(component, '__mounted__', true);
    return mountPrimitiveComponent(component, container);
  }

  throw new Error('Unrecognized component: ' + component);
};

const mountCustomComponent = (
  component: CustomComponent,
  container: AbstractContainer,
) => {
  component.container = container;

  callWithErrorPropagation(component.parent, () => {
    if (isFunction(component.willMount)) {
      component.willMount();
    }
  });

  component.children.forEach((child) =>
    child ? mountComponent(child, container) : null,
  );

  callWithErrorPropagation(component.parent, () => {
    if (isFunction(component.didMount)) {
      component.didMount();
    }
  });

  return component;
};

const mountPrimitiveComponent = (
  component: BasicComponent,
  container: AbstractContainer,
) => {
  component.container = component.container || container; // PrimitiveInput will have predefined container

  switch (component.type) {
    case PRIMS.container:
      container.addChild(component.graphic);
      component.children.forEach((child) =>
        child ? mountComponent(child, component.graphic) : null,
      );
      component.update();
      break;
    case PRIMS.rectangle:
    case PRIMS.circle:
    case PRIMS.ellipse:
    case PRIMS.polygon:
      container.addChild(component.graphic);
      component.children.forEach((child) =>
        child ? mountComponent(child, component.graphic) : null,
      );
      component.update();
      break;
    case PRIMS.text:
    case PRIMS.line:
    case PRIMS.sprite:
      container.addChild(component.graphic);
      component.update();
      break;
    case PRIMS.fragment:
      component.children.forEach((child) =>
        child ? mountComponent(child, component.graphic) : null,
      );
      component.update();
      break;
    case PRIMS.input:
      component.container.addChild(component.graphic);
      component.graphic.parentContainer = container;
      component.update();
      break;
    default:
      break;
  }

  return component;
};
