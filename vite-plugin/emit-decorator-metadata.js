/**
 * esbuild, that used by vite as default js/ts compiler, does not support `emitDecoratorMetadata`,
 * it results that we can't get 'design:type' metadata, and have to mark the type for each property manually.
 * To solve this problem, we use tsc to transpile the source code before esbuild.
 * @see https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import path from 'path';
import typescript from 'typescript';
import { createFilter } from '@rollup/pluginutils';
// only check top level class declaration
var hasClassDeclaration = function (ast) {
    return ast.statements.some(function (statement) { return statement.kind === typescript.SyntaxKind.ClassDeclaration; });
};
export default function (options) {
    var _a;
    if (options === void 0) { options = {}; }
    var tsConfigPath = options.tsconfig
        ? path.resolve(options.tsconfig)
        : path.resolve(process.cwd(), 'tsconfig.json');
    var tsconfig = (_a = typescript.readConfigFile(tsConfigPath, typescript.sys.readFile).config) !== null && _a !== void 0 ? _a : {};
    var compilerOptions = __assign(__assign({}, tsconfig.compilerOptions), { module: typescript.ModuleKind.ESNext, sourceMap: false });
    var filter = createFilter(options.include, options.exclude);
    return {
        name: 'emit-decorator-metadata',
        enforce: 'pre',
        transform: function (source, id) {
            if (!filter(id)) {
                return source;
            }
            var ast = typescript.createSourceFile(path.basename(id), source, typescript.ScriptTarget.ESNext, true);
            if (!hasClassDeclaration(ast)) {
                return source;
            }
            var program = typescript.transpileModule(source, { compilerOptions: compilerOptions });
            return {
                code: program.outputText,
                map: program.sourceMapText
            };
        }
    };
}
