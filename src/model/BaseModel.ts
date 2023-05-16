import {
  instanceToInstance,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer'
import { getModelConf } from '../decorator/ModelConf'
import { getFieldConf, getFieldConfs } from '../decorator/FieldConf'
import { camelize, namingCaseFnMap } from '../helpers'

// every model should extend this class
export default class BaseModel {
  clone() {
    return instanceToInstance(this)
  }
  toJsonString() {
    return JSON.stringify(this.toPlain())
  }
  override(target: typeof this) {
    return (Reflect
      .getPrototypeOf(this)!
      .constructor as unknown as typeof BaseModel)
      .from({...this.toPlain(), ...target.toPlain()})
  }
  toPlain() {
    const prototype = Reflect.getPrototypeOf(this)!
    return serializeNamingCase(instanceToPlain(this), prototype.constructor as any)
  }
  static getFieldConf(field: string) {
    return getFieldConf(this.prototype, field)
  }
  static getFieldConfs() {
    return getFieldConfs(this.prototype)
  }
  static getModelConf() {
    return getModelConf(this)
  }
  static from(raw: string | Object) {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    return plainToInstance(this, deserializeNamingCase(obj, this))
  }
}

// convert naming case to forwarded naming case while serializing
function serializeNamingCase(obj: Object | any, cls: typeof BaseModel) {
  if (typeof obj !== 'object' || Object.is(obj, null) || Array.isArray(obj)) {
    return obj
  }
  const transformed: Record<keyof any, any> = {}
  const modelConf = cls.getModelConf()
  const fieldConfs = cls.getFieldConfs()
  const confs = Object.values(fieldConfs)
  for (let [k, v] of Object.entries(obj)) {
    if (!confs.some((conf) => conf.fieldName === k)) {
      const fieldConf = fieldConfs[k]
      if (fieldConf?.rename) {
        k = namingCaseFnMap[fieldConf.rename](k)
      } else if (modelConf?.rename) {
        k = namingCaseFnMap[modelConf.rename](k)
      }
    }
    if (fieldConfs[k]?.type?.prototype instanceof BaseModel) {
      v = serializeNamingCase(v, fieldConfs[k].type)
    }
    transformed[k] = v
  }
  return transformed
}

// convert naming case to camel case while deserializing
function deserializeNamingCase(obj: Object | any, cls: typeof BaseModel) {
  if (typeof obj !== 'object' || Object.is(obj, null) || Array.isArray(obj)) {
    return obj
  }
  const transformed: Record<keyof any, any> = {}
  const fieldConfs = cls.getFieldConfs()
  const confs = Object.values(fieldConfs)
  for (let [k, v] of Object.entries(obj)) {
    if (!confs.some((conf) => conf.fieldName === k)) {
      k = camelize(k)
    }
    if (fieldConfs[k]?.type?.prototype instanceof BaseModel) {
      v = deserializeNamingCase(v, fieldConfs[k].type)
    }
    transformed[k] = v
  }
  return transformed
}
