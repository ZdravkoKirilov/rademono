import { Subject } from "rxjs";
import { Howl } from 'howler';

import { RuntimeSonata, SONATA_PLAY_TYPE } from "@app/game-mechanics";

export class SoundPlayer {
  done$: Subject<unknown> = new Subject();
  playing = false;

  private sonata: RuntimeSonata;
  private active: Howl[] = [];

  play(sonata: RuntimeSonata) {
    this.sonata = sonata;
    this.playing = true;
    this.startSounds();
  }

  private startSounds() {
    const { type } = this.sonata;

    if (type === SONATA_PLAY_TYPE.SEQUENCE) {
      this.playInSequence();
    } else {
      this.playInParallel();
    }
  }

  private playInSequence = () => {
    let currentHowl = 0;
    this.active = this.sonata.steps.map(step => {
      const sound = step.sound;
      const howl = new Howl({
        src: [sound.file],
        loop: step.loop,
        volume: step.volume || 1,
        rate: step.rate || 1,
      });
      howl.on('end', () => {
        currentHowl += 1;
        const nextHowl = this.active[currentHowl];
        if (nextHowl) {
          nextHowl.play();
        } else {
          this.onDone();
        }
      });
      return howl;
    });
    const firstHowl = this.active[0];

    if (firstHowl) {
      const state = firstHowl.state();
      if (state === 'loaded') {
        firstHowl.play();
      } else {
        firstHowl.once('load', function () {
          firstHowl.play();
        });
      }
    }
  }

  private playInParallel = () => {
    let pending = this.sonata.steps.length;
    this.active = this.sonata.steps.map(step => {
      const sound = step.sound;
      const howl = new Howl({
        src: [sound.file],
        loop: step.loop,
        volume: step.volume || 1,
        autoplay: true,
        rate: step.rate || 1,
      });

      howl.on('end', () => {
        pending -= 1;
        if (pending === 0) {
          this.onDone();
        }
      });

      return howl;
    });
  }

  onDone = () => {
    this.stop();
    this.done$.next();
  }

  stop() {
    this.playing = false;
    this.active.forEach(howl => howl.stop());
    this.active = [];
  }
}