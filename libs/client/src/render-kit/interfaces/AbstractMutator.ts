import { RzSize, BasicComponent } from "../internal";

export abstract class AbstractMutator {
    abstract updateComponent(component: BasicComponent): void;

    abstract removeComponent(component: BasicComponent): void;

    abstract getSize(component: BasicComponent): RzSize;
};