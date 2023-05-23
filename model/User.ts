import BaseModel from './BaseModel'
import Model from '../decorator/Model'
import Field from '../decorator/Field'
import { NamingCase } from '../naming-case'
import { TransformationType } from 'class-transformer'
import { dateTransformer } from '../transformer'
import { Dayjs } from 'dayjs'
import Validator from '../decorator/Validator'
import { Pattern, Range, Required } from '../validator'

@Model({ name: 'Profile Model', rename: NamingCase.PascalCase })
class Profile extends BaseModel { }

@Model({ name: 'Fake Model', rename: NamingCase.NonCase })
class FakeModel extends BaseModel { }

// every model must extends BaseModel
// rename indicates which naming-case conversion strategy will be used when serializing this model
// and the default value is NamingCase.camelCase when not specified
@Model({ name: 'User Model', rename: NamingCase.snake_case })
export default class User extends BaseModel {
  // specifying a fieldName that is different from property name will override the rename behavior of @Model
  // set a default value for this field, and it will be used when creating an instance with DemoUser.default()
  // but even specified a default value, you still need to specify the type, because type inference is invalid in emitDecoratorMetadata feature ('design:type' is Object)
  @Field({ name: 'User Id', fieldName: 'uid' })
  id: number = 0

  @Field({ name: 'First Name' })
  firstName!: string

  @Field({ name: 'Last Name' })
  lastName!: string

  @Field({ name: 'Age' })
  // specify validators for this field, and it will be used when validating this field by calling `User.prototype.validate('age')` or `User.prototype.validate()`
  @Validator(Required(), Range(0, 120))
  age!: number

  @Field({
    name: 'Mobile Phone',
    description: 'this is a description for mobile phone field'
  })
  // specify a validator that validates the field value is a valid mobile phone number
  @Validator(Pattern(/^1[3456789]\d{9}$/))
  mobilePhone!: string

  // `transform` set the transformation strategy for this field when serializing and deserializing
  // there are 2 attention points:
  // 1. this data should be handled entirely by yourself, and the library will not do anything for you
  // 2. no need to specify the type of this field, because the type of this field is determined by the return value of the transform function
  @Field({
    name: 'Last Modified',
    transform: dateTransformer('YYYY-MM-DD HH:mm:ss')
  })
  lastModified?: Dayjs

  @Field({
    name: 'Custom Transform',
    transform({ value, type }) {
      if (type === TransformationType.PLAIN_TO_CLASS) {
        // transform to a model instance (if it is a model)
        // @ts-ignore
        SomeModel.from(value)
      }
      if (type === TransformationType.CLASS_TO_PLAIN) {
        // transform to a plain object
        value.toPlain()
      }
      
      // in the end, return a clone of the value
      return value.clone()
    }
  })
  // @ts-ignore
  customTransform!: SomeModel

  // if current field is an array, you need to specify the type of the array elements
  // because tsc will only infer it as Array, not Array<Profile> in the compiler
  // which will cause the data not to be converted to Profile type when deserializing
  @Field({ name: 'Profile', type: Profile })
  profile!: Profile[]

  @Field({ name: '全名' })
  get fullName() {
    return '123'
  }

  // when ignore is true, this field will be ignored when serializing and deserializing
  // when ignore is { onDeserialize: true, onSerialize: false }, this field will be ignored when deserializing
  // when ignore is { onDeserialize: false, onSerialize: true }, this field will be ignored when serializing
  @Field({ name: 'Password', ignore: true })
  password: string = '123'

  // if you don't want to convert the field name to naming case for the field name in the map
  // you can specify an empty class and inherit BaseModel, and specify rename to NamingCase.NonCase with @Model
  // because the naming case conversion of any field name will be affected by its own type
  // if the type itself does not inherit BaseModel or is not decorated with @Model
  // it will look up to the parent type until it finds a type that inherits BaseModel and is decorated with @Model
  // a more extreme case is to implement the transform method yourself to control the behavior of serialization/deserialization, you can refer to transformer.ts
  @Field({ name: 'Map', type: FakeModel })
  map!: Record<string, any>

  // as default, getter field will not be serialized, if you want to serialize it, you need to specify fieldName
  // and getter field will never be deserialized
  @Field({ name: 'Adult', fieldName: 'is_adult' })
  get isAdult() {
    return this.age >= 18
  }
}

// get the model settings
User.getModel()
// get the field settings
User.getField('id')
// get all field settings
User.getFields()

const raw = {
  uid: 0,
  first_name: 'Nikola',
  last_name: 'Jokic',
  age: 28,
  mobile_phone: '13800138000',
  last_modified: '2020-01-01 00:00:00',
  custom_transform: { a_a: 123, AB_CD: 'abc' },
  profile: [],
  password: 'xxxxx_password',
  map: {
    key_1: 'value_1',
    KEY2: 'value_2',
    'key-3': 'value_3'
  }
}

// deserialize a plain object to a model instance
const user = User.from(raw)
// serialize a model instance to a plain object
const plain = user.toPlain()

console.log('user', user)
console.log('plain', plain)

// clone a model instance
const cloned = user.clone()
cloned.id = 2
// merge clone to another model instance, and user field values will be overwritten by cloned field values
user.merge(cloned)

console.log('user', user)
console.log('cloned', cloned)

// mix clone and use and return a new User instance, and original user and cloned will not be changed
const mixed = user.mix(cloned)
console.log('mixed', mixed)

// create a new model instance with default values
const dft = User.default()
dft.age = -1

// validate age whether is valid
dft.validate('age').then((error) => {
  if (!error) {
    // age is valid
  }
})
// validate firstName whether is valid
dft.validate('firstName').then((error) => {
  if (!error) {
    // firstName is valid
  }
})
// validate all fields whether are valid
dft.validate().then((errors) => {
  if (!errors?.length) {
    // all fields are valid
  }
})
