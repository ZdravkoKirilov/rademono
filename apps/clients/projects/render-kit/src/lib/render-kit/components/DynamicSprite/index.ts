import { createElement, SpriteProps, WithAssets, WithAssetProps, CustomComponent } from '../../internal';

export class DynamicSprite extends CustomComponent<SpriteProps> {
  
  render() {
    const { props } = this;

    return props.image ? createElement<WithAssetProps>(
      WithAssets,

      { urls: [props.image] },

      createElement<SpriteProps>(
        'sprite',
        { ...props },
      ),
    ) : null;
  }

}