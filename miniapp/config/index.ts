import path from 'node:path';

import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  projectName: 'major-direction-miniapp',
  date: '2026-06-14',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    640: 2.34,
    750: 1,
    828: 1.81
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: 'webpack5',
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  plugins: ['@tarojs/plugin-platform-weapp'],
  mini: {
    postcss: {
      pxtransform: {
        enable: true
      },
      cssModules: {
        enable: false
      }
    }
  }
});
