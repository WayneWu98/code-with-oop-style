import 'reflect-metadata'
import { NamingCase } from '../enum'

interface ModelConf {
  name?: string
  rename?: NamingCase
}

const modelConfKey = Symbol("modelConf")
const modelFieldsKey = Symbol("modelFields")

export default function (conf: ModelConf) {
  return Reflect.metadata(modelConfKey, conf)
}

export function getModelConf(cls: Object): ModelConf {
  return Reflect.getMetadata(modelConfKey, cls)
}

export function getModelFields(cls: Object): string[] {
  return Reflect.getMetadata(modelFieldsKey, cls)
}

export function setModelFields(cls: Object, fields: string[]) {
  Reflect.defineMetadata(modelFieldsKey, fields, cls)
}
