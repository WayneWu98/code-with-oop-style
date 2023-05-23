<script setup lang="ts">
import User from '../model/User';

const fields = User.getFields();
</script>

<template>
  <div>
    <form>
      <div>
        <label for="">
          <span>{{ fields.firstName.name }}</span>
          <input type="text" :placeholder="fields.firstName.description" />
        </label>
      </div>
      <div>
        <label for="">
          <span>{{ fields.mobilePhone.name }}</span>
          <input type="text" :placeholder="fields.mobilePhone.description" />
        </label>
      </div>
    </form>
  </div>
</template>