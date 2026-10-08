import { mergeRsbuildConfig } from '@rsbuild/core';
import type { StorybookConfig } from 'storybook-react-rsbuild';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: 'storybook-react-rsbuild',
    options: {},
  },
  staticDirs: ['../public'],
  // Storybook serves the app's rsbuild.config.ts, which opens its own browser window on start.
  rsbuildFinal: (rsbuildConfig) => mergeRsbuildConfig(rsbuildConfig, { server: { open: false } }),
};
export default config;
