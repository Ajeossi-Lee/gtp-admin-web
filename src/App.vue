<template>
  <el-config-provider :locale="locale">
    <!-- <AppProvider> -->
    <router-view />
    <!-- </AppProvider> -->
  </el-config-provider>
</template>

<script setup lang="ts">
import en from 'element-plus/es/locale/lang/en'
// import { AppProvider } from '@/components/application'

const locale = en
</script>

<style lang="scss">
:root {
  --el-color-primary: #165dff !important;
  --el-color-primary-light-3: #4080ff !important;
  --el-color-primary-light-9: #e8f3ff !important;
  --el-color-primary-dark-2: #0e42d2 !important;
}
</style>
