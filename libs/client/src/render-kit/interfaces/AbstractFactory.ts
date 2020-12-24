import { Dictionary } from "@app/shared";

import { RzElement, MetaProps, Component, RzElementType, BasicComponent, AbstractContainer } from "../internal";

export abstract class AbstractFactory {

    abstract createComponent(element: RzElement, meta: MetaProps): BasicComponent;

    customResolvers?: Array<Dictionary<Component>>;

    addCustomResolver: (config: Dictionary<RzElementType>) => void;
};

export type Renderer = (element: RzElement, meta: MetaProps, container: AbstractContainer) => void;