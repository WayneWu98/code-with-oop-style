import {
  Expose,
} from 'class-transformer'
import 'reflect-metadata'
import { NamingCase } from '../enum'

interface FieldConfOptions {
  name?: string
  fieldName?: string
  rename?: NamingCase
  description?: string
}

interface FieldConf extends FieldConfOptions {
  type: any
}

const fieldConfKey = Symbol("fieldConf")
const fieldsKey = Symbol("fields")

function getFields(prototype: Object): string[] {
  return Reflect.getMetadata(fieldsKey, prototype) || []
}

function addField(prototype: Object, field: string) {
  Reflect.defineMetadata(
    fieldsKey,
    [...getFields(prototype), field],
    prototype
  )
}

export default function (conf: FieldConfOptions) {
  const { fieldName } = conf
  const decorators: Function[] = []
  if (fieldName) decorators.push(Expose({ name: fieldName }))
  return function (...params: any[]) {
    const [prototype, propertyKey] = params
    addField(prototype, propertyKey)
    Reflect.defineMetadata(fieldConfKey, conf, prototype, propertyKey)
    decorators.forEach((decorator) => decorator(...params))
  }
}

export function getFieldConf(prototype: Object, field: string): FieldConf {
  return {
    ...Reflect.getMetadata(fieldConfKey, prototype, field),
    type: Reflect.getMetadata("design:type", prototype, field)
  }
}

export function getFieldConfs(prototype: Object) {
  return getFields(prototype).reduce((map, field) => {
    map[field] = getFieldConf(prototype, field)
    return map
  }, {} as Record<string, FieldConf>)
}
