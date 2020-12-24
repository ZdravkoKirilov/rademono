import { get }  from "lodash";

import { GameState, GameTemplate } from "../game-entities";

export type ExpressionContext = {
  state: GameState;
  conf: GameTemplate;

  // players: Player[];
  // self: Player,

  helpers: { [key: string]: Function; }, // predefined expressions + html5 apis
  get: typeof get,
  createElement: Function; // render-kit

  disableInteractions?: boolean;

  // eventBus: HomeMadeEventEmitter;

  mutateState: (payload: MutateStatePayload) => void; // game state
  saveToProfile: Function; // player settings
  listenTo: Function; // connect to sockets
  sendMessage: Function;  // send through sockets
};

type MutateStatePayload = {
  path: string;
  value: any;
  broadcastTo?: number[];
  save?: boolean;
}