import { map } from "rxjs/operators";

import { Dictionary } from "@app/shared";

import { CustomComponent, TransitionAnimationsPlayer } from "../../internal";

type RuntimeTransition = any;

export type RzTransitionProps = {
  transitions: RuntimeTransition[];
  context: {
    component: CustomComponent;
    props: Dictionary;
    state: Dictionary
  };
  onUpdate: (payload: Dictionary) => void;
  onDone?: (transition: RuntimeTransition) => void;
};

export class RzTransition extends CustomComponent<RzTransitionProps> {
  players: { [id: string]: TransitionAnimationsPlayer } = {};

  createPlayers() {
    this.players = this.props.transitions
      .filter(transition => {
        if (typeof transition.enabled === 'function') {
          return transition.enabled({
            state: this.props.context.state,
            props: this.props.context.props,
            component: this.props.context.component,
          });
        }
        return true;
      })
      .reduce((acc, elem) => {
        const player = new TransitionAnimationsPlayer(elem);

        player.updates$.pipe(
          map(animatingValue => this.props.onUpdate(animatingValue))
        ).subscribe();

        if (this.props.onDone) {
          player.done$.pipe(
            map(() => this.props.onDone!(player.config))
          ).subscribe();
        }

        acc[elem.id] = player;
        return acc;
      }, {});
  }

  didMount() {
    this.createPlayers();
  }

  willReceiveProps(nextProps: RzTransitionProps) {
    if (nextProps.transitions !== this.props.transitions) {
      this.createPlayers();
    }
  }

  didUpdate(/* payload: DidUpdatePayload<RzTransitionProps> */) {
    /*if (Object.values(this.players).every(player => !player.isActive)) {
      const prevContext = payload.prev.props.context;
      const nextContext = payload.next.props.context;

      const reformattedPayload: AnimationPayload = {
        prev: {
          state: prevContext.state,
          props: prevContext.props,
          component: prevContext.component,
        },
        next: {
          state: nextContext.state,
          props: nextContext.props,
          component: nextContext.component,
        }
      };

      Object.values(this.players).forEach(player => {
         if (player.config.trigger(reformattedPayload)) {
          player.play(reformattedPayload);
        } 
      });
    } */
  }

  willUnmount() {
    Object.values(this.players).forEach(player => player.stop());
  }

  render() {
    return this.props.children as any;
  }
}