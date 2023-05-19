<script setup lang="ts">
import { ref, toRaw, toValue, watch } from 'vue';
import UserForm from './components/UserForm.vue'
import User from './model/User';

const raw = {
  uid: 1,
  name: 'Jack',
  mobile_phone: '13800138000',
  last_modified: '2023-01-01 00:00:00',
  profile: [{ nickname: 'bomb', wechat_no: 'ccc' }],
}

const user = ref(User.from(raw))

const cloned = user.value.clone()
cloned.id += 2
// console.log('cloned', user.value.toPlain());

watch(user, user => {
  // console.log('user changed', toRaw(user));
}, { immediate: true, deep: true })
</script>
<template>
  <div>
    <UserForm />
    <button @click="user.id++">click me, {{ user.id }}</button>
  </div>
</template>