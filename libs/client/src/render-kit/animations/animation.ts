import { Subject } from "rxjs";
import { TweenMax, TimelineMax } from 'gsap';
import { map } from "rxjs/operators";

import { Dictionary } from '@app/shared';
import { ANIMATION_PLAY_TYPE, RuntimeAnimation, RuntimeAnimationStep } from "@app/game-mechanics";

import { mapEasing, CustomComponent } from "../internal";

export type AnimationPayloadSegment<Props = any, State = any> = {
  state: State,
  props: Props,
  component: CustomComponent,
};

export type AnimationPayload<Props = any, State = any> = {
  prev: AnimationPayloadSegment<Props, State>,
  next: AnimationPayloadSegment<Props, State>,
};

export class TransitionAnimationsPlayer {
  updates$: Subject<Dictionary>;
  done$: Subject<unknown>;

  isActive = false;

  private player = new AnimationPlayer();

  constructor(public config: object) {
    this.updates$ = this.player.updates$;
    this.done$ = this.player.done$;
  }

  play = (data: AnimationPayload) => {
    const { animation } = this.config as any;
    this.player.play(animation, data);
    this.isActive = true;
    this.player.done$.pipe(
      map(() => this.isActive = false),
    ).subscribe();
  }

  stop() {
    this.player.stop();
  }
}

export class AnimationPlayer {
  updates$ = new Subject<Dictionary>();
  done$ = new Subject();

  playing = false;
  data: AnimationPayload;

  private timeline: TimelineMax;
  private config: RuntimeAnimation;

  constructor() { }

  play(config: RuntimeAnimation, data: AnimationPayload) {
    this.config = config;
    this.playing = true;
    this.data = data;
    this.startTweens();
  }

  private startTweens() {
    const { type } = this.config;

    if (type === ANIMATION_PLAY_TYPE.SEQUENCE) {
      this.playInSequence();
    } else {
      this.playInParallel();
    }
  }

  private playInParallel = () => {
    const { repeat, bidirectional, delay } = this.config;
    this.timeline = this.createParallelTweens(this.config, this.onUpdate, this.onDone);
    this.timeline.repeat(repeat || 0);
    this.timeline.yoyo(bidirectional || false);
    this.timeline.delay(delay / 1000 || 0);
  }

  private playInSequence = () => {
    const { repeat, bidirectional, delay } = this.config;
    this.timeline = this.createTweenSequence(this.config, this.onUpdate, this.onDone);
    this.timeline.repeat(repeat || 0);
    this.timeline.yoyo(bidirectional || false);
    this.timeline.delay(delay / 1000 || 0);
  }

  onDone = () => {
    this.stop();
    this.playing = false;
    this.done$.next();
  }

  onUpdate = (interpolatingStyle: Dictionary) => {
    this.updates$.next(interpolatingStyle);
  }

  stop() {
    if (this.timeline) {
      this.timeline.kill();
    }
  }

  createParallelTweens = (
    config: RuntimeAnimation,
    onUpdate: (interpolatingStyle: Dictionary<number>) => void,
    onDone: () => void,
  ) => {
    const { steps } = config;
    const timeline = new TimelineMax();

    steps.map(step => {
      const tween = this.createTween(step, onUpdate);
      timeline.add(tween);
      return tween;
    });

    timeline.eventCallback('onComplete', () => {
      onDone();
    });

    return timeline;
  };

  createTweenSequence = (
    config: RuntimeAnimation,
    onUpdate: (interpolatingData: Dictionary) => void,
    onDone: () => void,
  ) => {
    const { steps } = config;
    const timeline = new TimelineMax();

    steps.forEach(step => {
      const {
        from_value, from_style, to_value, to_style,
        duration, delay, bidirectional, repeat, easing, transform_result
      } = step;

      const start = from_value ? { ...from_value(this.data as any) } : { ...from_style };
      const end = to_value ? { ...to_value(this.data as any) } : { ...to_style };
      const target = {};

      // TODO: support scale: "1.2 1.2" and so on

      const toVars: gsap.AnimationVars = {
        ...end,
        ease: mapEasing(easing),
        delay: delay > 1 ? delay / 1000 : 0,
        yoyo: bidirectional,
        duration: duration / 1000,
        repeat
      };
      timeline.fromTo(target, start as any, toVars);

      timeline.eventCallback('onUpdate', () => {
        if (transform_result) {
          const copy = { ...target } as any;
          delete copy['_gsap'] as any;
          onUpdate(transform_result(copy));
        } else {
          const copy = { ...target } as any;
          delete copy['_gsap'] as any;
          onUpdate(copy);
        }
      });
    });

    timeline.eventCallback('onComplete', () => {
      onDone();
    });

    return timeline;
  };

  createTween = (data: RuntimeAnimationStep, onUpdate: (interpolatingStyle: Dictionary) => void) => {
    const { from_value, to_value, from_style, to_style,
      easing, duration, delay = 0, repeat, bidirectional, transform_result } = data;

    const start = from_value ? { ...from_value(this.data as any) } : { ...from_style };
    const end = to_value ? { ...to_value(this.data as any) } : { ...to_style };
    const target = {};

    const toVars: gsap.AnimationVars = {
      ...end,
      ease: mapEasing(easing),
      delay: delay > 1 ? delay / 1000 : 0,
      yoyo: bidirectional,
      duration: duration / 1000,
      repeat
    };

    const tween = TweenMax.fromTo(target, toVars.duration, start as any, toVars);

    tween.eventCallback('onUpdate', () => {
      if (transform_result) {
        const copy = { ...target } as any;
        delete copy['_gsap'];
        onUpdate(transform_result(copy));
      } else {
        const copy = { ...target } as any;
        delete copy['_gsap'];
        onUpdate(copy);
      }
    });

    return tween;
  }
}
