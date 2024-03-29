import { Theme } from './theme.model';

export const colorPalette = {
  'color-primary-100': '#F4D0F9',
  'color-primary-200': '#E5A4F4',
  'color-primary-300': '#C471E0',
  'color-primary-400': '#9C4AC2',
  'color-primary-500': '#6A1B9A',
  'color-primary-600': '#531384',
  'color-primary-700': '#3E0D6E',
  'color-primary-800': '#2C0859',
  'color-primary-900': '#1F0549',
  'color-primary-transparent-100': 'rgba(106, 27, 154, 0.08)',
  'color-primary-transparent-200': 'rgba(106, 27, 154, 0.16)',
  'color-primary-transparent-300': 'rgba(106, 27, 154, 0.24)',
  'color-primary-transparent-400': 'rgba(106, 27, 154, 0.32)',
  'color-primary-transparent-500': 'rgba(106, 27, 154, 0.4)',
  'color-primary-transparent-600': 'rgba(106, 27, 154, 0.48)',

  'color-secondary-dark': '#2a1b9a',
  'color-secondary-main': '#5549ae',
  'color-secondary-light': '#d4d1eb',

  'color-tertiary': '#9a1b8b',
  'color-tertiary-light': '#cd8dc5',

  'color-success-100': '#F0F9CA',
  'color-success-200': '#E0F497',
  'color-success-300': '#BFDF5F',
  'color-success-400': '#99C036',
  'color-success-500': '#699607',
  'color-success-600': '#568105',
  'color-success-700': '#446C03',
  'color-success-800': '#345702',
  'color-success-900': '#284801',
  'color-success-transparent-100': 'rgba(105, 150, 7, 0.08)',
  'color-success-transparent-200': 'rgba(105, 150, 7, 0.16)',
  'color-success-transparent-300': 'rgba(105, 150, 7, 0.24)',
  'color-success-transparent-400': 'rgba(105, 150, 7, 0.32)',
  'color-success-transparent-500': 'rgba(105, 150, 7, 0.4)',
  'color-success-transparent-600': 'rgba(105, 150, 7, 0.48)',

  'color-info-100': '#C7F9E9',
  'color-info-200': '#92F4DC',
  'color-info-300': '#59DEC9',
  'color-info-400': '#2FBEB3',
  'color-info-500': '#009193',
  'color-info-600': '#00717E',
  'color-info-700': '#005669',
  'color-info-800': '#003E55',
  'color-info-900': '#002D46',
  'color-info-transparent-100': 'rgba(0, 145, 147, 0.08)',
  'color-info-transparent-200': 'rgba(0, 145, 147, 0.16)',
  'color-info-transparent-300': 'rgba(0, 145, 147, 0.24)',
  'color-info-transparent-400': 'rgba(0, 145, 147, 0.32)',
  'color-info-transparent-500': 'rgba(0, 145, 147, 0.4)',
  'color-info-transparent-600': 'rgba(0, 145, 147, 0.48)',

  'color-warning-100': '#FCF0CA',
  'color-warning-200': '#FADE97',
  'color-warning-300': '#F0C261',
  'color-warning-400': '#E1A53A',
  'color-warning-500': '#CE7C02',
  'color-warning-600': '#B16301',
  'color-warning-700': '#944D01',
  'color-warning-800': '#773900',
  'color-warning-900': '#622B00',
  'color-warning-transparent-100': 'rgba(206, 124, 2, 0.08)',
  'color-warning-transparent-200': 'rgba(206, 124, 2, 0.16)',
  'color-warning-transparent-300': 'rgba(206, 124, 2, 0.24)',
  'color-warning-transparent-400': 'rgba(206, 124, 2, 0.32)',
  'color-warning-transparent-500': 'rgba(206, 124, 2, 0.4)',
  'color-warning-transparent-600': 'rgba(206, 124, 2, 0.48)',

  'color-danger-100': '#FAE0D0',
  'color-danger-200': '#F6BDA4',
  'color-danger-300': '#E38B72',
  'color-danger-400': '#C95C4B',
  'color-danger-500': '#A5231C',
  'color-danger-600': '#8D1418',
  'color-danger-700': '#760E1A',
  'color-danger-800': '#5F081A',
  'color-danger-900': '#4F051A',
  'color-danger-transparent-100': 'rgba(165, 35, 28, 0.08)',
  'color-danger-transparent-200': 'rgba(165, 35, 28, 0.16)',
  'color-danger-transparent-300': 'rgba(165, 35, 28, 0.24)',
  'color-danger-transparent-400': 'rgba(165, 35, 28, 0.32)',
  'color-danger-transparent-500': 'rgba(165, 35, 28, 0.4)',
  'color-danger-transparent-600': 'rgba(165, 35, 28, 0.48)',

  'color-background-dark': '#F5F5F6',
  'color-background-light': '#ffffff',

  'color-text-dark': '#252625',
  'color-text-light': '#ffffff',
};

export const lightTheme: Theme = {
  name: 'light',
  properties: {
    '--background-dark': colorPalette['color-background-dark'],
    '--on-background-dark': colorPalette['color-text-light'],

    '--background-light': colorPalette['color-background-light'],
    '--on-background-light': colorPalette['color-text-dark'],

    '--error': colorPalette['color-danger-500'],
    '--error-light': colorPalette['color-danger-transparent-100'],

    '--info': colorPalette['color-info-500'],
    '--on-info': colorPalette['color-text-light'],

    '--success': colorPalette['color-success-500'],
    '--success-light': colorPalette['color-success-transparent-100'],

    '--warning': colorPalette['color-warning-500'],
    '--warning-light': colorPalette['color-warning-transparent-100'],

    '--primary-dark': colorPalette['color-primary-800'],
    '--on-primary-dark': colorPalette['color-text-light'],

    '--primary-main': colorPalette['color-primary-500'],
    '--on-primary-main': colorPalette['color-text-light'],
    '--primary-transparent': colorPalette['color-primary-transparent-600'],
    '--primary-main-1': colorPalette['color-primary-400'],

    '--primary-light': colorPalette['color-primary-200'],
    '--on-primary-light': colorPalette['color-text-dark'],

    '--secondary': '#E87E20',
    '--tertiary': '#DB4553',

    '--space-1': '8px',
    '--space-2': '16px',
    '--space-3': '24px',
    '--space-4': '32px',
    '--space-5': '64px',

    '--text-base': '1em',

    '--border-1': '1px',
    '--border-2': '2px',
  },
};
