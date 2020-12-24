import { BasicComponent, RzElementPrimitiveProps, MetaProps, Points, RzStyles } from '../../internal';

export type PolygonProps = RzElementPrimitiveProps & {
  points: Points;
} & {
  styles: Required<Pick<RzStyles, 'stroke_thickness' | 'stroke_color' | 'x' | 'y'>>;
};
export class PrimitivePolygon extends BasicComponent<PolygonProps> {

  constructor(props: PolygonProps, graphic: any, meta: MetaProps) {
    super(props, graphic, meta);
  }

  shouldRerender(nextProps: PolygonProps) {
    return nextProps.styles !== this.props.styles || nextProps.points !== this.props.points;
  }
}