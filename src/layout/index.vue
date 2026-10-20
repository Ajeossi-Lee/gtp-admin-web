<template>
  <div class="admin-layout">
    <div class="admin-shell">
      <header class="admin-header">
        <lee-header :collapsed="collapsed" @toggle-collapse="collapsed = !collapsed" />
      </header>
      <div class="admin-body">
        <aside class="admin-aside" :style="{ width: collapsed ? '64px' : '220px' }">
          <lee-menu :collapsed="collapsed" />
        </aside>
        <section class="admin-content">
          <div class="admin-crumb">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#4E5969" stroke-width="1.4"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M5.6 3h8.8M5.6 8h8.8M5.6 13h8.8" />
              <circle cx="2.2" cy="3" r=".9" fill="#4E5969" stroke="none" />
              <circle cx="2.2" cy="8" r=".9" fill="#4E5969" stroke="none" />
              <circle cx="2.2" cy="13" r=".9" fill="#4E5969" stroke="none" />
            </svg>
            <template v-if="crumbParent">
              <span>{{ crumbParent }}</span>
              <span class="sep">/</span>
            </template>
            <span>{{ crumbCurrent }}</span>
          </div>
          <el-main v-loading="pageLoading" class="lee-layout-content admin-main">
            <router-view v-slot="{ Component }">
              <transition name="fade">
                <component :is="Component"></component>
              </transition>
            </router-view>
          </el-main>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="lee-layout">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import leeHeader from './components/leeHeader.vue'
import LeeMenu from './components/leeMenu.vue'
import useConfigStore from '@/store/modules/config'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'LeeLayout'
})

const collapsed = ref(true)
const { pageLoading } = storeToRefs(useConfigStore())
const route = useRoute()

const crumbCurrent = computed(() => (route.meta.title as string) || 'Home')
const crumbParent = computed(() => {
  if (
    route.path.startsWith('/protein-info') ||
    route.path.startsWith('/protein-images') ||
    route.path.startsWith('/protein-image-submit') ||
    route.path.startsWith('/gene-gtp')
  ) {
    return 'Data'
  }
  return ''
})
</script>

<style>
.admin-layout {
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  font-size: 14px;
  background: #fff;
}

.admin-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.admin-header {
  height: 60px;
  flex: none;
  border-bottom: 1px solid var(--border-2);
}

.admin-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.admin-aside {
  flex: none;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid var(--border-2);
  transition: width 0.2s;
}

.admin-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  overflow: hidden;
}

.admin-crumb {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  color: var(--text-2);
  font-size: 14px;
}

.admin-crumb .sep {
  color: var(--text-4);
}

.admin-main {
  flex: 1;
  min-height: 0;
  padding: 0 !important;
  overflow: auto !important;
}

.el-aside {
  transition: all 0.2s;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}

.fade-leave-from {
  opacity: 1;
}

.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-active {
  transition-delay: 0.3s;
}
</style>
