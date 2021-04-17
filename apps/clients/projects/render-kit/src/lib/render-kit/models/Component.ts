import {
  BasicComponent, CustomComponent, RzElementProps
} from "../internal";
import { RzElementPrimitiveProps } from "./RzElement";

export type Component<T extends Partial<RzElementPrimitiveProps> = {}> =
  BasicComponent<T> | CustomComponent<T>;

export type DidUpdatePayload<Props = any, State = any> = {
  prev: {
    state: State;
    props: Props;
  };
  next: {
    state: State;
    props: Props;
  };
}

export interface ComponentConstructor<T extends Partial<RzElementProps> = {}> {
  new(props: T, graphic: any): CustomComponent;
}

export type AbstractGraphic = {
  component: BasicComponent;
}