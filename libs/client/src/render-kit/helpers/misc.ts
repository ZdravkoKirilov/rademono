import * as Color from 'color';

import {
  AbstractFactory, CustomComponent, BasicComponent, Component,
} from '../internal';

export const getRealType = (factory: AbstractFactory, type: string) => {
  const realType = factory.customResolvers!.reduce(
    (acc: any, resolver) => {
      if (type in resolver) {
        return resolver[type] as any;
      }
      return acc;
    },
    null
  );
  return realType as any;
}

export const isPrimitiveComponent = (component: Component): component is BasicComponent => component instanceof BasicComponent;

export const isCustomComponent = (component: Component): component is CustomComponent => {
  return component instanceof CustomComponent;
}

export const toNumericColor = (value: string | number) => {
  const color = Color(value);
  const asArray = color.rgb().array();
  return asArray;
};

export const toHexColor = (value: string | number | string[] | number[]) => {
  if (typeof value === 'string') {
    if (value.startsWith('#')) {
      const result = value.replace('#', '0x');
      return Number(result);
    }
    // throw new Error('Unrecognized value: ' + value);
  }

  const color = Array.isArray(value) ? Color.rgb(value) : Color(value);
  const result = color.hex().replace('#', '0x');
  return Number(result);
};

export const toHexColorString = (value: string | number | string[] | number[]) => {
  if (typeof value === 'string') {
    if (value.startsWith('#')) {
      const result = value.replace('#', '0x');
      return result;
    }
  }

  const color = Array.isArray(value) ? Color.rgb(value) : Color(value);
  const result = color.hex();
  return result;
};

export const calculateScaling = (target: [number, number], original: [number, number]) => {
  return `${target[0] / original[0]} ${target[1] / original[1]}`
    .split(' ')
    .map(elem => isNaN(Number(elem)) ? 1 : elem)
    .join(' ');
};

