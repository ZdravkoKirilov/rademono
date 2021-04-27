export type Theme = {
  name: 'light' | 'dark';
  properties: {
    '--background-dark': string;
    '--on-background-dark': string;

    '--background-light': string;
    '--on-background-light': string;

    '--primary-dark': string;
    '--on-primary-dark': string;

    '--primary-main': string;
    '--on-primary-main': string;
    '--primary-transparent': string;
    '--primary-main-1': string;

    '--primary-light': string;
    '--on-primary-light': string;

    '--success': string;
    '--success-light': string;

    '--info': string;
    '--on-info': string;

    '--warning': string;
    '--warning-light': string;

    '--error': string;
    '--error-light': string;

    '--space-1': string;
    '--space-2': string;
    '--space-3': string;
    '--space-4': string;

    '--text-base': string;
    '--text-xs': string;
    '--text-s': string;
    '--text-m': string;
    '--text-l': string;
    '--text-xl': string;

    '--font-1': string;
    '--font-2': string;
    '--font-3': string;
    '--font-weight-s': number;
    '--font-weight-m': number;
    '--font-weight-l': number;

    '--border-1': string;
    '--border-2': string;

    '--border-radius-1': string;
    '--border-radius-2': string;
  };
};