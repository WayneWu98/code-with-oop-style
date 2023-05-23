import "reflect-metadata"
import { createApp } from 'vue'

import App from './App.vue'
import User from "./model/User"
createApp(App).mount('#app')

// this library is based on `decorator` feature, you should enable `experimentalDecorators` and `emitDecoratorMetadata` in your tsconfig.json
// `emitDecoratorMetadata` is required for `@Field` decorator, it helpers to get the type of the field, but it relies on compiler, unfortunately, it's not supported in `esbuild` yet. and `tsc` is recommended. We also provide a vite plugin to help you do this.