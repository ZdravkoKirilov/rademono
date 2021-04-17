export interface AbstractLoader {
  loadAll(resources: Set<string>): Promise<LoaderResources>;
  loadOne(url: string): Promise<LoaderResource>;
  isBusy: boolean;
}

export type LoaderResources = {
  [key: string]: LoaderResource;
};

export type LoaderResource = {
  texture: any;
}