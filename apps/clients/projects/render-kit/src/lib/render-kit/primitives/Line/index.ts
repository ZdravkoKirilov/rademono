import { BasicComponent, RzElementPrimitiveProps, MetaProps, Points } from '../../internal';

export type LineProps = RzElementPrimitiveProps & {
  points: Points;
  dashGap?: number;
}
export class PrimitiveLine extends BasicComponent<LineProps> {

  constructor(props: LineProps, graphic: any, meta: MetaProps) {
    super(props, graphic, meta);
  }

  shouldRerender(nextProps: LineProps) {
    return nextProps.styles !== this.props.styles || nextProps.points !== this.props.points;
  }
}