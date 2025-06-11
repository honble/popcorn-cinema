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
          // @/styles/xxx.module.scss 같은 경로 사용
          '@': path.resolve(__dirname, '../src'),
        },
      },
      server: {
        // 파일변경 감지
        watch: {
          usePolling: true, // 🔁 변경 감지 방식 변경
          interval: 1000, // 🔁 감지 주기 1초
        },
      },
    });
  },
};
export default config;
