import BaseModel from './BaseModel'
import Model from '../decorator/Model'
import Field from '../decorator/Field'
import { NamingCase } from '@/utils/naming-case'
import { TransformationType } from 'class-transformer'
import { dateTransformer } from '@/utils/transformer'
import { Dayjs } from 'dayjs'
import Validator from '@/decorator/Validator'
import { Pattern, Range } from '@/utils/validator'

@Model({ name: '用户资料', rename: NamingCase.PascalCase })
class Profile extends BaseModel { }

@Model({ name: '假模型', rename: NamingCase.NonCase })
class FakeModel extends BaseModel { }

// 所有 model 必须继承 BaseModel
// rename 指定了这个类在序列化时字段名风格的转换方式，
// 如果不指定则默认为 snake_case
@Model({ name: '示例用户', rename: NamingCase.snake_case })
export default class User extends BaseModel {
  // 指定一个与类属性名不同的字段名，fieldName 会覆盖 @Model 的 rename 行为
  // 可以指定默认值，使用 DemoUser.default() 创建实例时会使用默认值，
  // 但即便指定了默认值，仍需要进行类型标注，因为类型推断在 emitDecoratorMetadata feature 中无效 ('design:type' 为 Object)
  @Field({ name: '用户ID', fieldName: 'uid' })
  id: number = 0

  @Field({ name: '姓' })
  firstName!: string

  @Field({ name: '名' })
  lastName!: string

  @Field({ name: '年龄' })
  // 添加校验规则
  @Validator(Range(0, 120))
  age!: number

  @Field({
    name: '手机号',
    description: '11位手机号码'
  })
  @Validator(Pattern(/^1[3456789]\d{9}$/))
  mobilePhone!: string

  // transform 指定了这个字段值在序列化时的转换方式，
  // 指定 transform 有两个注意的地方：
  // 1. 该字段的数据完全需要自己手动处理，包括字段名的命名规范（如果是一个 object 的话）
  // 2. 无需再指定 type，因为 type 本身只是默认的一个转换方式，但 type 无论在 序列化 还是 反序列化时，都只会笨拙的转换为 type 指定类型，缺少了针对 序列化/反序列化 的区分处理
  @Field({
    name: '创建时间',
    transform: dateTransformer('YYYY-MM-DD HH:mm:ss')
  })
  lastModified?: Dayjs

  @Field({
    name: '自定义转换',
    transform({ value, type }) {
      if (type === TransformationType.PLAIN_TO_CLASS) {
        // 反序列化时，转为字符串
        return JSON.stringify(value)
        // 又或者直接转为另一个数据模型
        // SomeModel.from(value)
      }
      if (type === TransformationType.CLASS_TO_PLAIN) {
        // 序列化时，转为对象
        return JSON.parse(value)
        // 又或者直接序列化（如果是一个数据模型的话）
        // value.toPlain()
      }
      return value
    }
  })
  customTransform!: string

  // 如果该类型是一个 Profile 组成的数组，需要指定 type 为数组元素的类型
  // 因为在编译器 tsc 只会默认推导为 Array，而不会推导为 Array<Profile>
  // 导致最终序列化时，数据不会转换为 Profile 类型
  @Field({ name: '个人资料', type: Profile })
  profile!: Profile[]

  @Field({ name: '全名' })
  get fullName() {
    return '123'
  }

  // ignore 传递 true 控制 序列化 和 反序列化 时忽略该字段
  // ignore 传递 { onDeserialize: true, onSerialize: false } 控制只在反序列化（`DemoUser.from()`）时忽略该字段
  // ignore 传递 { onDeserialize: false, onSerialize: true } 控制只在序列化（`DemoUser.toPlain()`）时忽略该字段
  @Field({ name: '密码', ignore: true })
  password: string = '123'

  // 如果对于 map 里的字段名不需要进行 naming case 的转换
  // 可以设定一个空的class，并继承 BaseModel，同时用 @Model 指定 rename 为 NamingCase.NonCase
  // 因为任何字段的命名风格转换都将受自身类型的影响，如果自身类型没有继承 BaseModel 或 没有装饰 @Model
  // 则会向父类型进行查找，直到找到一个继承 BaseModel 并装饰了 @Model 的类型
  // 更为极端的情况可以自行实行 transform 方法，以控制 序列化/反序列化 的行为，可以参考 utils/transformer.ts
  @Field({ name: '假模型', type: FakeModel })
  map!: Record<string, any>

  // getter 默认不会序列化，如果想序列化，需要指定 fieldName
  // getter 在反序列化时永远会被忽略
  @Field({ name: '是否成年', fieldName: 'is_adult' })
  get isAdult() {
    return this.age >= 18
  }
}

// 获取 Model 的配置
User.getModel()
// 获取某个字段的配置
User.getField('id')
// 获取所有字段的配置
User.getFields()

const raw = {
  uid: 0,
  first_name: '张',
  last_name: '三',
  age: 18,
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

// 使用 from 反序列化
const user = User.from(raw)
// 使用 toPlain 序列化
const plain = user.toPlain()

console.log('user', user)
console.log('plain', plain)

// 克隆出新的 model 实例
const cloned = user.clone()
cloned.id = 2
// 将另一个合并到 user, 会覆盖掉 user 中的字段
user.merge(cloned)

console.log('user', user)
console.log('cloned', cloned)

// 混合两个 user 并返回新的实例，不会修改原有实例
const mixed = user.mix(cloned)
console.log('mixed', mixed)

// 创建一个默认的实例
const dft = User.default()
dft.age = -1

// 校验某个字段 age
dft.validate('age').then((errors) => {
  console.log('validate age results', errors)
})
// 校验某个字段 firstName
dft.validate('firstName').then((errors) => {
  console.log('validate firstName results', errors)
})
// 校验所有字段
dft.validate().then((errors) => {
  console.log('results', errors)
})
