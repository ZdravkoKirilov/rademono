import { BasicComponent, RzElementPrimitiveProps, MetaProps, RzStyles } from '../../internal';

export type PrimitiveRectangleProps = RzElementPrimitiveProps & {
  styles: Required<Pick<RzStyles, 'stroke_thickness' | 'stroke_color' | 'x' | 'y' | 'width' | 'height'>>;
};
export class PrimitiveRectangle extends BasicComponent<PrimitiveRectangleProps> {

  constructor(props: PrimitiveRectangleProps, graphic: any, meta: MetaProps) {
    super(props, graphic, meta);
  }

  shouldRerender(nextProps: PrimitiveRectangleProps) {
    return nextProps.styles !== this.props.styles;
  }
}