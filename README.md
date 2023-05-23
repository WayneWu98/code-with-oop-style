# Decorative Model

When handle transfer data between client and server, we always need to transform the data, it mostly is boring and repetitive work:

1. firstly, we need to declare a interface to describe the data structure
2. secondly, we just use `JSON.parse` and `JSON.stringify` to transform the data between JSON String and JS Plain Object, fortunately, this work was done by other libraries (axios, fetch, etc.)

And there are some common cases we are facing:

1. the data structure is not the same between client and server, for example, the server return a snake case JSON String, but we need to use camel case in client side.
2. interface is not enough to describe the data structure, for example, we need to add some extra properties in client side, and it is not necessary to send these properties to server.

For dealing with these cases, we have to do some extra and repetitive work, and mostly, it is not easy to maintain and is ugly-prone.

Decorator is a good way to solve these problems, it can help us to do some extra work when we declare a class or a property, and it is easy to maintain and extend. By using decorator and class, we can code with OOP style, and it is more readable and maintainable.

`class-transformer` is a good library to help us to deal with these works, it provides some decorators and methods to help us to transform the data between client and server, so we no more need to do these works manually and focus on the business logic. And for much easier to use, this library further box the `class-transformer`, and provide a simple API to use. not only that, this library also provide validate feature, it can help us to validate the data before we send it to server.

## Features

1. Auto convert naming case between deserialization/serialization;
2. Vite plugin to make esbuild support `emitDecoratorMetadata`;
3. Useful built-in API to make model code reuseable and maintainable.

## Usage

For mostly cases, refer to [./src/model/User.ts](./src/model/User.ts)

## Attentions

1. This library is based on `decorator` feature, you should enable `experimentalDecorators` and `emitDecoratorMetadata` in your tsconfig.json
2. `emitDecoratorMetadata` is required for `@Field` decorator, it helpers to get the type of the field, but it relies on compiler, unfortunately, it's not supported in `esbuild` yet. `tsc` and `swc` are recommended. We also provide a vite plugin to help you do this.

```typescript
import emitDecoratorMetadata from 'decorative-model/vite-plugin/emit-decorator-metadata'

// esbuild does not support emitDecoratorMetadata
export default defineConfig({
  /** ... */
  plugins: [
    emitDecoratorMetadata({ include: [/.ts$/], tsconfig: 'tsconfig.json' }),
  ],
  /** ... */
})
```

3. We assume the naming case standard you are using, is camel-case in client-side and snake-case in server-side, so by default behavior, property names of plain object will be camelized before deserialization, snakeized before serialization. For customizing this behavior, we also make it configurable.

```typescript
import { NamingCase, setDefaultClassNamingCase, setDefaultPlainNamingCase } from 'decorative-model'

// NamingCase.snake_case
// NamingCase.camelCase
// NamingCase.PascalCase
// NamingCase.NonCase

// when you are using snake-case in client side
setDefaultClassNamingCase(NamingCase.snake_case)

// when you are using camel-case in server side
setDefaultPlainNamingCase(NamingCase.camelCase)

// when your client side and server side is using the same naming-case standard,
// you should just do this, and declare fields in class whatever.
setDefaultClassNamingCase(NamingCase.NonCase)
setDefaultPlainNamingCase(NamingCase.NonCase)
```