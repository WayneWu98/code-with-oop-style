/**
 * there are some validator functions for `Validator` decorator (ref to decorator/Validator.ts),
 * it can be used to validate value while calling Model.validate().
 *
 * @example:
 * import Validator from 'decorator/Validator'
 * import { Required, Range } from 'utils/validator'
 *
 * @Validator(Required(), Range(1, 10))
 */

// !!!! ATTENTION !!!!
// every validator function should return a Promise, and `resolve()` when value is valid, `reject('error message')` when value is invalid
// !!!! ATTENTION !!!!

type MessageProvider = ((value: any, obj: any) => string) | string

export const Required = (message: MessageProvider = 'This field is required!') => {
  return (value: any, obj: any) => {
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value === undefined || value === null || value === '') {
      // @ts-ignore
      return Promise.reject(typeof message === 'function' ? message(value, obj) : message)
    }
    return Promise.resolve()
  }
}

/**
 * range in [min, max] (min and max are included)
 */
export const Range = (min: number, max: number, message: MessageProvider = `The value should be ranged between ${min} and ${max}, including boundary.`) => {
  return (value: any, obj: any) => {
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value < min || value > max) {
      // @ts-ignore
      return Promise.reject(typeof message === 'function' ? message(value, obj) : message)
    }
    return Promise.resolve()
  }
}

/**
 * length in [min, max] (min and max are included)
 */
export const Length = (min: number, max: number, message: MessageProvider = `The length should be ranged between ${min} and ${max}, including boundary.`) => {
  return (value: any, obj: any) => {
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value.length < min || value.length > max) {
      // @ts-ignore
      return Promise.reject(typeof message === 'function' ? message(value, obj) : message)
    }
    return Promise.resolve()
  }
}

export const Pattern = (pattern: RegExp, message: MessageProvider = 'The value is incorrect.') => {
  return (value: any, obj: any) => {
    if (!pattern.test(value)) {
      // @ts-ignore
      return Promise.reject(typeof message === 'function' ? message(value, obj) : message)
    }
    return Promise.resolve()
  }
}
