import { Nominal, Omit } from 'simplytyped';
import { isObject, omit } from 'lodash/fp';

import { BaseModel, GameEntityParser, WithStyle } from "./Base.model";
import { ParamedExpressionFunc } from "./Expression.model";
import { CoreStyles, Style } from "./Style.model";
import { toModuleId } from './Module.model';
import { Game, GameLanguage, GameLanguageId, toGameLanguageId } from './Game.model';
import { Tagged } from '../types';
import { enrichEntity, parseAndBind, safeJSON } from '../shared';

export type TextId = Nominal<string, 'TextId'>;
export const toTextId = (source: unknown) => String(source) as TextId;

export type Text = BaseModel<TextId> & WithStyle & Tagged<'Text', {
  default_value: string;
  translations: Translation[];
}>

export type DtoText = Omit<Text, '__tag' | 'id' | 'module' | 'translations'> & {
  id: number;
  module: number;
  translations: DtoTranslation[];
};

export type RuntimeText = Omit<Text, 'style' | 'style_inline'> & {

  style: ParamedExpressionFunc<RuntimeText, Style>;
  style_inline: CoreStyles;

  computed_value: string;
};

export const Text: GameEntityParser<Text, DtoText, RuntimeText> & TextOperations = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Text',
        ...input
      } as Text;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Text',
      id: toTextId(dto.id),
      module: toModuleId(dto.module),
      translations: dto.translations.map(elem => Translation.toEntity(elem))
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      module: Number(entity.module),
      translations: entity.translations.map(elem => Translation.toDto(elem))
    };
  },

  toRuntime(context, text, language: GameLanguageId) {
    let runtimeText = enrichEntity<Text, RuntimeText>(context.conf, {
      style_inline: src => safeJSON(src, {}),
      style: src => parseAndBind(context)(src),
    }, text);

    const translation = runtimeText.translations?.find(elem => elem.language === language);
    runtimeText = { ...runtimeText, computed_value: translation?.value || runtimeText.default_value };
    return runtimeText;
  },

  saveTranslation(text, translation) {
    return {
      ...text,
      translations: text.translations.map(elem => elem.id === translation.id ? translation : elem),
    };
  },

  removeTranslation(text, translation) {
    return {
      ...text,
      translations: text.translations.filter(elem => elem.id !== translation.id)
    };
  },

};

type TextOperations = {
  saveTranslation: (text: Text, Translation: Translation) => Text;
  removeTranslation: (text: Text, Translation: Translation) => Text;
}

export type TranslationId = Nominal<string, 'TranslationId'>;
const toTranslationId = (source: unknown) => String(source) as TranslationId;

export type Translation = Tagged<'Translation', {
  id: TranslationId;
  owner: TextId;

  language: GameLanguageId;
  value: string;
}>;

export type DtoTranslation = Omit<Translation, '__tag' | 'id' | 'owner' | 'language'> & {
  id: number;
  owner: number;
  language: number;
};

export type RuntimeTranslation = Omit<Translation, 'language'> & {
  language: GameLanguage;
};

const Translation: GameEntityParser<Translation, DtoTranslation, RuntimeTranslation> = {

  fromUnknown: {

    toEntity(input: unknown) {

      if (!isObject(input)) {
        throw new Error('NotAnObject');
      }

      return { //TODO: don't spread
        __tag: 'Translation',
        ...input
      } as Translation;
    },

  },

  toEntity(dto) {
    return {
      ...dto,
      __tag: 'Translation',
      id: toTranslationId(dto.id),
      owner: toTextId(dto.owner),
      language: toGameLanguageId(dto.language),
    };
  },

  toDto(entity) {
    return {
      ...omit('__tag', entity),
      id: Number(entity.id),
      owner: Number(entity.owner),
      language: Number(entity.language),
    };
  },

  toRuntime(context, entity, game: Game) {
    return enrichEntity<Translation, RuntimeTranslation>(context.conf, {
      language: id => game.languages.find(lang => lang.id === id)
    }, entity);
  }
};
