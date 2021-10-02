import { pathsToModuleNameMapper } from 'ts-jest/utils';

const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  roots: ['<rootDir>/projects'],
  modulePaths: ['<rootDir>/dist'],
};
