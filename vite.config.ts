import { defineConfig } from 'vite'
import swc from 'rollup-plugin-swc'
import vue from '@vitejs/plugin-vue'

// esbuild does not support emitDecoratorMetadata, use swc instead
export default defineConfig({
  plugins: [
    vue(),
    swc({
      test: 'ts',
      jsc: {
        target: 'es2021',
        transform: { decoratorMetadata: true },
        parser: { syntax: 'typescript', decorators: true },
      },
    })
  ],
  esbuild: false,
})