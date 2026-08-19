import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    '*.config.{js,ts}',
    'src/{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}',
    'src/queries/extensions/*.ts',
    // Added dynamically by src/scenes/AcceleratorRouter/Documents/PreviewView/index.tsx
    'public/js/paged-0.4.3.polyfill.min.js',
    'public/js/table-of-contents.js',
  ],
  project: ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,mdx,sass,scss}!'],
  ignore: ['src/queries/generated/**'],
};

export default config;
