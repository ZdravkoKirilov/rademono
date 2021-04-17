import { MetaProps, RzElementPrimitiveProps, BasicComponent } from "../../internal";

export class PrimitiveContainer extends BasicComponent<RzElementPrimitiveProps> {

  constructor(props: RzElementPrimitiveProps, graphic: any, meta: MetaProps) {
    super(props, graphic, meta);
  }

  shouldRerender(nextProps: RzElementPrimitiveProps) {
    return nextProps.styles !== this.props.styles || nextProps.children !== this.props.children;
  }

}