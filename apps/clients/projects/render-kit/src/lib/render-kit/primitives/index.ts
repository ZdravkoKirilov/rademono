export * from './Sprite';
export * from './Text';
export * from './Container';
export * from './Line';
export * from './Fragment';
export * from './Polygon';
export * from './Rectangle';
export * from './Circle';
export * from './Ellipse';
export * from './Input';

export const PRIMS = {
    sprite: 'sprite',
    text: 'text',
    circle: 'circle',
    ellipse: 'ellipse',
    line: 'line',
    rectangle: 'rectangle',
    container: 'container',
    fragment: 'fragment',
    polygon: 'polygon',
    input: 'input',
} as const;
