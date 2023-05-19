import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer'
import { getModel, Model } from '@/decorator/Model'
import { getField, getFields, Field, getFieldList } from '../decorator/Field'
import { NamingCase, camelize, namingCaseFnMap } from '@/utils/naming-case'
import { Validator, getFieldValidators } from '@/decorator/Validator'

// !!! every model should extend this class
export default class BaseModel {
  clone() {
    // instanceToInstance will not convert naming case, call our implementation instead
    const model = Reflect.getPrototypeOf(this)!.constructor as typeof BaseModel
    return model.from(this.toPlain()) as this
  }
  // merge target to this in-place, existing properties will be overwritten
  merge(target: typeof this) {
    return Object.assign(this, target)
  }
  // mix target and this to be a new instance
  mix(target: typeof this) {
    return Object.assign(this.clone(), target)
  }
  toPlain(): Object {
    const cls = Reflect.getPrototypeOf(this)!.constructor
    return convertNamingCaseOnSerialize(instanceToPlain(this), cls, cls)
  }
  // validate current model, return a list of errors, empty list means no error
  // and child models **will not** be validated automatically, you should do it yourself
  async validate<T extends BaseModel>(this: T, field?: keyof T) {
    const model = Reflect.getPrototypeOf(this)!.constructor as ClassConstructor<T>
    const validators = {} as Record<keyof typeof this, Validator[]>
    if (field) {
      validators[field] ??= []
      // @ts-ignore
      validators[field].push(...BaseModel.getFieldValidators.call(model, field))
      // Promise.allSettled(validators.map((validator) => validator(this[field], this)))
    } else {
      for (const [k, v] of Object.entries(BaseModel.getAllFieldValidators.call(model))) {
        // @ts-ignore
        validators[k] = v
      }
    }
    const errors = [] as { field: keyof T; message: string }[]
    await Promise.all(
      Object.entries(validators).map(([field, validators]) => {
        return Promise.all(validators.map((validator) => validator(this[field as keyof T], this))).catch(
          // @ts-ignore
          (err: Error) => errors.push({ field, message: err.message })
        )
      })
    )
    return errors
  }
  static getFieldValidators<T extends ClassConstructor<BaseModel>>(this: T, field: keyof InstanceType<T>) {
    return getFieldValidators(this, field)
  }
  static getAllFieldValidators<T extends ClassConstructor<BaseModel>>(this: T) {
    return getFieldList(this).reduce((map, field) => {
      map[field] = (this as any).getFieldValidators(field)
      return map
    }, {} as Record<keyof InstanceType<T>, Validator[]>)
  }
  static default<T extends ClassConstructor<BaseModel>>(this: T) {
    return new this() as InstanceType<T>
  }
  static getField<T extends ClassConstructor<BaseModel>>(this: T, field: keyof InstanceType<typeof this>) {
    return getField(this, field)
  }
  static getFields<T extends ClassConstructor<BaseModel>>(this: T) {
    return getFields(this)
  }
  static getModel() {
    return getModel(this)
  }
  static from<T extends ClassConstructor<BaseModel>>(this: T, raw: string | Object): InstanceType<T> {
    if (raw instanceof BaseModel) {
      raw = raw.toPlain()
    } else if (typeof raw === 'string') {
      raw = JSON.parse(raw)
    }
    return plainToInstance(this, convertNamingCaseOnDeserialize(raw, this, this)) as InstanceType<T>
  }
}

// convert naming case to forwarded while serializing
function convertNamingCaseOnSerialize(obj: any, cls: any, superCls: any): any {
  if (typeof obj !== 'object' || Object.is(obj, null)) {
    // primitive type
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertNamingCaseOnSerialize(item, cls, superCls))
  }
  const transformed: Record<keyof any, any> = {}
  const model: Model = (cls?.getModel?.() ?? superCls?.getModel?.() ?? {}) as Model
  const fields = cls?.getFields?.() ?? {}
  const arrayedFields = Object.values(fields) as Field[]
  for (const [rawKey, rawValue] of Object.entries(obj)) {
    let key = rawKey
    const field = fields[key] as Field
    if (!arrayedFields.some((conf) => conf.fieldName === key)) {
      key = namingCaseFnMap[model?.rename ?? NamingCase.NonCase](key)
    }
    if (field?.transform) {
      transformed[key] = rawValue
      continue
    }
    const _superCls = cls?.prototype instanceof BaseModel ? cls : superCls
    transformed[key] = convertNamingCaseOnSerialize(rawValue, fields[rawKey]?.type, _superCls)
  }
  return transformed
}

// convert naming case to camel case while deserializing
function convertNamingCaseOnDeserialize(obj: any, cls: any, superCls: any): any {
  if (typeof obj !== 'object' || Object.is(obj, null)) {
    // primitive type
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertNamingCaseOnDeserialize(item, cls, superCls))
  }
  const transformed: Record<keyof any, any> = {}
  const model = (cls?.getModel?.() ?? superCls?.getModel?.() ?? {}) as Model
  const fields = cls?.getFields?.() ?? {}
  const arrayedFields = Object.values(fields) as Field[]
  for (const [rawKey, rawValue] of Object.entries(obj)) {
    let k = rawKey
    const shouldSkipConvert =
      arrayedFields.some((conf) => conf.fieldName === rawKey) || model?.rename === NamingCase.NonCase
    if (!shouldSkipConvert) {
      k = camelize(rawKey)
    }
    const field = fields[k] as Field
    if (field?.transform) {
      transformed[k] = rawValue
      continue
    }
    const _superCls = cls?.prototype instanceof BaseModel ? cls : superCls
    transformed[k] = convertNamingCaseOnDeserialize(rawValue, fields[rawKey]?.type, _superCls)
  }
  return transformed
}
