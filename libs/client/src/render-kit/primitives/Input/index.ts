import { RzElementPrimitiveProps, MetaProps, RzTextStyles, BasicComponent, GenericEvent } from "../../internal";

export type PrimitiveInputProps = RzElementPrimitiveProps & {
  value: string;
  textStyle: RzTextStyles;
  onChange: GenericEvent;
  multiline?: boolean;
};
export class PrimitiveInput extends BasicComponent<PrimitiveInputProps> {

  static defaultTextStyle = {
    fontFamily: 'Arial', fontSize: 24, stroke: '#ffffff', fill: ['#ffffff'], align: 'center', strokeThickness: 1,
  };

  constructor(props: PrimitiveInputProps, graphic: any, meta: MetaProps) {
    super(props, graphic, meta);
  }
}