import 'reflect-metadata'
import { NamingCase } from '@/utils/naming-case'

export interface Model {
  name?: string
  rename?: NamingCase
}

const MODEL_KEY = Symbol('MODEL')

export default function (conf: Model) {
  if (!Reflect.has(conf, 'rename')) {
    conf.rename = NamingCase.snake_case
  }
  return Reflect.metadata(MODEL_KEY, conf)
}

export function getModel(cls: Object): Model {
  return Reflect.getMetadata(MODEL_KEY, cls)
}
