import 'reflect-metadata'
import { NamingCase } from '../naming-case'

let defaultPlainNamingCase: NamingCase = NamingCase.snake_case
export const setDefaultPlainNamingCase = (namingCase: NamingCase) => defaultPlainNamingCase = namingCase

export interface Model {
  name?: string
  rename?: NamingCase
}

const MODEL_KEY = Symbol('MODEL')

export default function (conf: Model) {
  if (!Reflect.has(conf, 'rename')) {
    conf.rename = defaultPlainNamingCase
  }
  return Reflect.metadata(MODEL_KEY, conf)
}

export function getModel(cls: Object): Model {
  return Reflect.getMetadata(MODEL_KEY, cls)
}
