<script setup lang="ts">
import User from '../model/User';


const fieldConfs = User.getFieldConfs();
</script>

<template>
  <div>
    <form>
      <div>
        <label for="">
          <span>{{ fieldConfs.name.name }}</span>
          <input type="text" :placeholder="fieldConfs.name.description" />
        </label>
      </div>
      <div>
        <label for="">
          <span>{{ fieldConfs.mobilePhone.name }}</span>
          <input type="text" :placeholder="fieldConfs.mobilePhone.description" />
        </label>
      </div>
    </form>
  </div>
</template>