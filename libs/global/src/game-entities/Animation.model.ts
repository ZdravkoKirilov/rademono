import { Nominal, Omit } from 'simplytyped';
import { omit, isObject } from 'lodash/fp';

import { Dictionary, Tagged } from '../types';
import { enrichEntity, parseAndBind, safeJSON } from '../shared';

import { Style } from "./Style.model";
import { ParamedExpressionFunc } from "./Expression.model";
import { BaseModel, GameEntityParser } from "./Base.model";
import { toModuleId } from './Module.model';

export type AnimationId = Nominal<string, 'AnimationId'>;
const toAnimationId = (source: unknown) => String(source) as AnimationId;

type AnimationEasing = any;
type AnimationPayload = any;

export type Animation = Tagged<'Animation', BaseModel<AnimationId> & {

  type: AnimationPlayType;
  steps: AnimationStep[];

  repeat: number;
  bidirectional: boolean;
  delay: number;
}>;

export type DtoAnimation = Omit<Animation, '__tag' | 'type' | 'steps' | 'id' | 'module'> & {
  type: string;
  id: number;
  module: number;
  steps: DtoAnimationStep[];
};

export type RuntimeAnimation = Omit<Animation, 'steps'> & {
  steps: RuntimeAnimationStep[];
};

export const Animation: GameEntityParser<Animation, DtoAnimation, RuntimeAnimation> & AnimationOperations = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Animation',
        ...input
      } as Animation;
    },

  },

  toRuntime(context, animation) {
    return enrichEntity<Animation, RuntimeAnimation>(context.conf, {
      steps: (step: AnimationStep) => AnimationStep.toRuntime(context, step),
    }, animation);
  },

  toDto(animation) {
    return {
      ...omit('__tag', animation),
      id: Number(animation.id),
      module: Number(animation.module),
      type: String(animation.type),
      steps: animation.steps.map(elem => AnimationStep.toDto(elem))
    };
  },

  toEntity(animationDto) {
    return {
      ...animationDto,
      __tag: 'Animation',
      id: toAnimationId(animationDto.id),
      module: toModuleId(animationDto.module),
      type: animationDto.type as AnimationPlayType,
      steps: animationDto.steps.map(elem => AnimationStep.toEntity(elem))
    };
  },

  saveStep(animation, step) {
    return {
      ...animation,
      steps: animation.steps.map(elem => elem.id === step.id ? step : elem)
    }
  },

  removeStep(animation, step) {
    return {
      ...animation,
      steps: animation.steps.filter(elem => elem.id !== step.id)
    };
  },

}

type AnimationOperations = {
  saveStep: (animation: Animation, step: AnimationStep) => Animation;
  removeStep: (animation: Animation, step: AnimationStep) => Animation;
}

export type AnimationStepId = Nominal<string, 'AnimationStepId'>;
const toAnimationStepId = (source: unknown) => String(source) as AnimationStepId;

export type AnimationStep = Tagged<'AnimationStep', {
  id: AnimationStepId;
  owner: AnimationId;

  name: string;

  from_value: string; // this is the place for dynamic styles as well, but also arbitrary values not part of RzStyle
  to_value: string;

  from_style: string;
  to_style: string;

  transform_result: string;

  easing: AnimationEasing;
  delay: number;
  duration: number;

  repeat: number;
  bidirectional: boolean;
}>;

export type DtoAnimationStep = Omit<AnimationStep, 'id' | 'owner' | '__tag'> & {
  id: number;
  owner: number;
}

export type RuntimeAnimationStep = Omit<AnimationStep, 'from_value' | 'to_value' | 'from_style' | 'to_style' | 'transform_result'> & {
  from_value: ParamedExpressionFunc<AnimationPayload, Dictionary>;
  to_value: ParamedExpressionFunc<AnimationPayload, Dictionary>;

  from_style: Style;
  to_style: Style;

  transform_result: ParamedExpressionFunc<Dictionary, Dictionary>;
}

const AnimationStep: GameEntityParser<AnimationStep, DtoAnimationStep, RuntimeAnimationStep> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'AnimationStep',
        ...input
      } as AnimationStep;
    },

  },

  toRuntime(context, step) {

    return enrichEntity<AnimationStep, RuntimeAnimationStep>(context.conf, {
      from_style: (src: string) => safeJSON(src, {}),
      to_style: (src: string) => safeJSON(src, {}),
      from_value: (src: string) => parseAndBind(context)(src),
      to_value: (src: string) => parseAndBind(context)(src),
      transform_result: (src: string) => parseAndBind(context)(src),
    }, step);
  },

  toDto(animationStep) {
    return {
      ...omit('__tag', animationStep),
      id: Number(animationStep.id),
      owner: Number(animationStep.owner),
    };
  },

  toEntity(dtoAnimationStep) {
    return {
      ...dtoAnimationStep,
      __tag: 'AnimationStep',
      id: toAnimationStepId(dtoAnimationStep.id),
      owner: toAnimationId(dtoAnimationStep.owner),
    };
  }

}

export const ANIMATION_PLAY_TYPE = {
  SEQUENCE: 'SEQUENCE',
  PARALLEL: 'PARALLEL',
} as const;

export type AnimationPlayType = keyof typeof ANIMATION_PLAY_TYPE;