import { MetaProps, BasicComponent, RzElementPrimitiveProps } from "../../internal";

export class PrimitiveFragment extends BasicComponent {

  constructor(props: RzElementPrimitiveProps, graphic: any, meta: MetaProps) {
    super(props, graphic, meta);
  }

  shouldRerender(nextProps: RzElementPrimitiveProps) {
    return nextProps.children !== this.props.children;
  }

}