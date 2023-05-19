import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import metadata from './metadata'

// esbuild does not support emitDecoratorMetadata, use swc instead
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
    ]
  },
  plugins: [
    metadata({ include: [/.ts$/], tsconfig: 'tsconfig.json' }),
    vue(),
  ],
})