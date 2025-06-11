import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  // SCSS 모듈 지원을 위한 Vite 설정
  viteFinal: async (config) => {
    return mergeConfig(config, {
      css: {
        modules: {
          // SCSS 모듈 파일 네이밍 규칙
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'), // @/styles/xxx.module.scss 같은 경로 사용
        },
      },
    });
  },
};
export default config;
