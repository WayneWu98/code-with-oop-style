import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import emitDecoratorMetadata from './vite-plugin/emit-decorator-metadata'

// esbuild does not support emitDecoratorMetadata, use swc instead
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: '/' },
    ]
  },
  plugins: [
    emitDecoratorMetadata({ include: [/.ts$/], tsconfig: 'tsconfig.json' }),
    vue(),
  ],
})