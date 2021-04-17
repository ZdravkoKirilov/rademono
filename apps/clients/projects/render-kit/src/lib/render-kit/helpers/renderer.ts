import {
  AbstractContainer, AbstractRenderEngine, Component, MetaProps, RzElement, mountComponent, createComponent,
  ContextManager, AssetManager
} from "../internal";

export const createRenderer = (engine: AbstractRenderEngine, resources: Set<string>, metaProps?: MetaProps) => {
  engine.factory.addCustomResolver({
  });

  const renderFunc = (elem: RzElement, container: AbstractContainer): Promise<Component> => {
    return new Promise(async (resolve) => {
      const assetManager = new AssetManager(engine.loader);

      await assetManager.addMany(resources);

      const meta = metaProps || {} as MetaProps;

      meta.engine = engine;

      meta.context = new ContextManager();

      meta.assets = assetManager;

      const rootComponent = createComponent(elem, engine.factory, meta, undefined);

      if (!rootComponent) {
        throw new Error('Root component must be valid');
      }

      meta.root = rootComponent;

      mountComponent(rootComponent, container);

      resolve(rootComponent);
    });
  }
  return renderFunc;
};