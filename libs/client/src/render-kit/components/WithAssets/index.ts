import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';

import { CustomComponent, AssetManagerSubscription } from "../../internal";

export type WithAssetProps = {
  urls: string[];
}

type State = {
  loaded: boolean;
}

export class WithAssets extends CustomComponent<WithAssetProps, State> {
  state: State = { loaded: true };

  sub: AssetManagerSubscription;

  render() {

    const shouldRender = this.props.urls.every(url => this.meta.assets.getTexture(url)) && this.state.loaded;

    return shouldRender ? this.props.children : null;
  }

  shouldUpdate(nextProps: WithAssetProps, nextState: State) {
    const newFile = nextProps.urls !== this.props.urls;
    return newFile || nextState.loaded;
  }

  willReceiveProps(nextProps: WithAssetProps) {
    if (!isEqual(nextProps.urls, this.props.urls)) {

      const newUrls = difference(nextProps.urls, this.props.urls);

      if (newUrls.length) {

        this.setState({ loaded: false });

        this.meta.assets.addMany(new Set(newUrls));
      }
    }
  }

  didMount() {
    const hasPendingFiles = this.props.urls.some(url => !this.meta.assets.getTexture(url));

    if (hasPendingFiles) {

      this.meta.assets.addMany(new Set(this.props.urls));

      this.sub = this.meta.assets.subscribe(() => {
        if (this.props.urls.every(url => this.meta.assets.getTexture(url))) {
          this.setState({ loaded: true });
        }
      });

    } else {

      this.setState({ loaded: true });
    }
  }

  willUnmount() {

    if (this.sub) {

      this.sub.unsubscribe();
    }
  }
}