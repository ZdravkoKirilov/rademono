import { BasicComponent, Component, RzPoint, RzEventTypes } from "../internal";

export abstract class AbstractEventManager {
    abstract assignEvents(comp: BasicComponent): void;
    abstract removeListeners(comp: BasicComponent): void;

    abstract focusComponent(comp: BasicComponent, event?: unknown): void;
};

export interface GenericEvent extends Partial<EventOptionalProps> {
    type: RzEventTypes;

    stopPropagation(): void;
    currentTarget: Component;
    originalTarget: Component;
    propagationStopped: boolean;
};

export type EventOptionalProps = {
    deltaY: number;
    key: string;
    keyCode: number;
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
    position: RzPoint;
    value: string;
}

export type GenericEventHandler<T = unknown> = (event: GenericEvent) => T | T[];