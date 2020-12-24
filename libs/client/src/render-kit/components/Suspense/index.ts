import { CustomComponent, RzElement } from "../../internal";

type State = {
  suspended: boolean;
}

export type SuspenseProps = {
  fallback: RzElement;
}

export class Suspense extends CustomComponent<SuspenseProps, State> {
  state = { suspended: false };

  didCatch(thrown: Error | Promise<any>) {

    if (thrown instanceof Promise) {

      this.setState({ suspended: true });

      thrown.then(() => {
        this.setState({ suspended: false });
      });

    } else {

      throw (thrown);
    }
  }

  render() {
    return this.state.suspended ? this.props.fallback : this.props.children;
  }
}