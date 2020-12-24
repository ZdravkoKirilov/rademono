import { WithKeysAs } from '@app/shared';

export const ANIMATABLE_PROPS = {
    width: 'width',
    height: 'height',
    stroke_color: 'stroke_color',
    stroke_thickness: 'stroke_thickness',
    fill: 'fill',
    x: 'x',
    y: 'y',
    font_size: 'font_size',
} as const;

export type AnimatableProps = Partial<WithKeysAs<typeof ANIMATABLE_PROPS, string | number>>;