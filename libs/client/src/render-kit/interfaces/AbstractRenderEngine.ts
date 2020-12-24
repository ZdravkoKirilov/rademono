import { AbstractFactory, AbstractMutator, AbstractEventManager, AbstractLoader } from "../internal";

export interface AbstractRenderEngine {
    factory: AbstractFactory;
    mutator: AbstractMutator;
    event: AbstractEventManager;
    loader: () => AbstractLoader;
    app: any;
    destroy(): void;
};