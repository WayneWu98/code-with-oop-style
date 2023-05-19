import { ClassConstructor, Expose, Transform, TransformFnParams } from 'class-transformer'
import 'reflect-metadata'
import { typeTransformer } from '@/utils/transformer'

export interface Field {
  name?: string
  fieldName?: string
  description?: string
  type?: any
  transform?: (params: TransformFnParams) => any
}

const FIELD_KEY = Symbol('FIELD')
const FIELDS_KEY = Symbol('FIELDS')

export function getFieldList<T extends ClassConstructor<any>>(cls: T): (keyof InstanceType<T>)[] {
  return Reflect.getMetadata(FIELDS_KEY, cls) || []
}

function addFieldItem<T extends ClassConstructor<any>>(cls: T, field: keyof InstanceType<T>) {
  Reflect.defineMetadata(FIELDS_KEY, [...new Set([...getFieldList(cls), field])], cls)
}

export function getField<T extends ClassConstructor<any>>(cls: T, field: keyof InstanceType<T>): Field {
  return Reflect.getMetadata(FIELD_KEY, cls.prototype, field as string)
}

export function getFields<T extends ClassConstructor<any>>(cls: T): Record<keyof InstanceType<T>, Field> {
  return getFieldList(cls).reduce((map, field) => {
    map[field] = getField(cls, field)
    return map
  }, {} as Record<keyof InstanceType<T>, Field>)
}

export default function (conf: Field) {
  return function (prototype: Object, propertyKey: string | symbol) {
    if (!Reflect.has(conf, 'type')) {
      conf.type = Reflect.getMetadata('design:type', prototype, propertyKey)
    }
    addFieldItem(prototype.constructor as ClassConstructor<any>, propertyKey)
    Reflect.defineMetadata(FIELD_KEY, conf, prototype, propertyKey)
    if (!Reflect.has(conf, 'transform')) {
      Transform(typeTransformer(conf.type))(prototype, propertyKey)
    } else {
      Transform(conf.transform!)(prototype, propertyKey)
    }
    if (conf.fieldName) {
      Expose({ name: conf.fieldName })(prototype, propertyKey)
    }
  }
}
