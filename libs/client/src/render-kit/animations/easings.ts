import { Power0, Power1, Power2, Power3, Power4, Elastic, Bounce, Expo, SteppedEase } from "gsap";

export const ANIMATION_EASINGS = {
    'POWER0.IN': Power0.easeIn,
    'POWER0.OUT': Power0.easeOut,
    'POWER0.IN_OUT': Power0.easeInOut,

    'POWER1.IN': Power1.easeIn,
    'POWER1.OUT': Power1.easeOut,
    'POWER1.IN_OUT': Power1.easeInOut,

    'POWER2.IN': Power2.easeIn,
    'POWER2.OUT': Power2.easeOut,
    'POWER2.IN_OUT': Power2.easeInOut,

    'POWER3.IN': Power3.easeIn,
    'POWER3.OUT': Power3.easeOut,
    'POWER3.IN_OUT': Power3.easeInOut,

    'POWER4.IN': Power4.easeIn,
    'POWER4.OUT': Power4.easeOut,
    'POWER4.IN_OUT': Power4.easeInOut,

    'ELASTIC.IN': Elastic.easeIn,
    'ELASTIC.OUT': Elastic.easeOut,
    'ELASTIC.IN_OUT': Elastic.easeInOut,

    'BOUNCE.IN': Bounce.easeIn,
    'BOUNCE.OUT': Bounce.easeOut,
    'BOUNCE.IN_OUT': Bounce.easeInOut,

    'EXPO.IN': Expo.easeIn,
    'EXPO.OUT': Expo.easeOut,
    'EXPO.IN_OUT': Expo.easeInOut,

    'STEPPED': SteppedEase,
} as const;

export type AnimationEasing = keyof typeof ANIMATION_EASINGS;

export const mapEasing = (key: string) => {
    return (ANIMATION_EASINGS as any)[key] || Power0.easeInOut;
};