<script setup lang="ts">
import { languages } from "../data/types";
</script>

<template>
  <select>
    <template v-for="language in languages">
      <option :value="language.code">{{ language.name }}</option>
    </template>
  </select>
</template>
