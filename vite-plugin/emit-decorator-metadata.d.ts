/**
 * esbuild, that used by vite as default js/ts compiler, does not support `emitDecoratorMetadata`,
 * it results that we can't get 'design:type' metadata, and have to mark the type for each property manually.
 * To solve this problem, we use tsc to transpile the source code before esbuild.
 * @see https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
import { FilterPattern } from '@rollup/pluginutils';
interface Options {
    include?: FilterPattern;
    exclude?: FilterPattern;
    tsconfig?: string;
}
export default function (options?: Options): Plugin;
export {};
