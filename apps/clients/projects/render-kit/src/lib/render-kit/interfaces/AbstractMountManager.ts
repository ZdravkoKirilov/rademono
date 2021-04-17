import { Component, RzElementType, AbstractRenderEngine } from "../internal";

export type MountConfig<T = any> = {
  width?: number;
  height?: number;
  backgroundColor?: number;
  assets?: Set<string>;
  props?: T;
  registerComponents?: (engine: AbstractRenderEngine) => void;
}

export type MountRef = {
  component: Component;
  destroy: () => void;
}

export type AbstractMountManager<> = (
  rootComponent: RzElementType,
  DOMHost: HTMLElement,
  config: MountConfig,
) => Promise<MountRef>;