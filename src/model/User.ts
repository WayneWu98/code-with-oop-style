import BaseModel from './BaseModel'
import ModelConf from '../decorator/ModelConf'
import FieldConf from '../decorator/FieldConf'
import { NamingCase } from '../enum'
import { Transform, Type } from 'class-transformer'

@ModelConf({ name: "用户基本资料", rename: NamingCase.snake_case })
export class Profile extends BaseModel {
  @FieldConf({ name: '昵称' })
  nickname!: string
  wechatNo!: string
}

@ModelConf({ name: "用户", rename: NamingCase.snake_case })
export default class User extends BaseModel {
  // specify field name
  @FieldConf({ fieldName: "uid", name: '用户ID' })
  id!: number

  @FieldConf({ name: '用户名称' })
  name!: string

  @FieldConf({ name: '手机号', description: '11位手机号码' })
  mobilePhone!: string

  @FieldConf({ name: '创建时间' })
  @Transform(({ value, type}) => {
    if (!value) return value
    // type is enum between 0 and 1, 0 means plainToClass, 1 means classToPlain
    if (type) {
      return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()} 00:00:00`
    }
    return new Date(value)
  })
  lastModified?: Date

  @FieldConf({ name: '个人资料' })
  @Type(() => Profile)
  profile!: Profile
}
