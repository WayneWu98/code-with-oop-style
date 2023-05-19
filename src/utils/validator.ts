/**
 * there are some validator functions for `Validator` decorator (ref to @/decorator/Validator.ts),
 * it can be used to validate value while calling Model.validate().
 *
 * @example:
 * import Validator from '@/decorator/Validator'
 * import { Required, Range } from '@/utils/validator'
 *
 * @Validator(Required(), Range(1, 10))
 */

// !!!! ATTENTION !!!!
// every validator function should return a Promise, and `resolve()` when value is valid, `reject(new Error('error detail'))` when value is invalid
// !!!! ATTENTION !!!!

export const Required = (message = '必填') => {
  return (value: any) => {
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value === undefined || value === null || value === '') {
      return Promise.reject(new Error(message))
    }
    return Promise.resolve()
  }
}

/**
 * range in [min, max] (min and max are included)
 */
export const Range = (min: number, max: number, message = `范围 ${min} ~ ${max}`) => {
  return (value: any) => {
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value < min || value > max) {
      return Promise.reject(new Error(message))
    }
    return Promise.resolve()
  }
}

/**
 * length in [min, max] (min and max are included)
 */
export const Length = (min: number, max: number, message = `长度 ${min} ~ ${max}`) => {
  return (value: any) => {
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value.length < min || value.length > max) {
      return Promise.reject(new Error(message))
    }
    return Promise.resolve()
  }
}

export const Pattern = (pattern: RegExp, message = '格式不正确') => {
  return (value: any) => {
    if (!pattern.test(value)) {
      return Promise.reject(new Error(message))
    }
    return Promise.resolve()
  }
}
