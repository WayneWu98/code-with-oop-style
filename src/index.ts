import "reflect-metadata"
import { createApp } from 'vue'
import User from './model/User'

import App from './App.vue'

const raw1 = {
  uid: 1,
  name: 'Jack',
  mobile_phone: '13800138000',
  last_modified: '2023-01-01 00:00:00',
  profile: { nickname: 'bomb', wechat_no: 'ccc' },
}
const raw2 = { uid: 2, name: 'Jane', mobile_phone: '15294529319' }
const user1 = User.from(raw1)
const user2 = User.from(raw2)

const override = user1.override(user2)

console.log('override', override)
console.log('raw', raw1)
console.log('user', user1)
console.log('plain', user1.toPlain())

createApp(App).mount('#app')