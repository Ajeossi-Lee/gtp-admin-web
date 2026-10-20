<template>
  <div class="admin-menu">
    <el-menu :default-active="activePath" :collapse="collapsed" :collapse-transition="false" router class="side-menu">
      <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Connection, FirstAidKit, HomeFilled, Picture, Upload } from '@element-plus/icons-vue'

defineOptions({
  name: 'LeeMenu'
})

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()

const menus = [
  { path: '/home', title: 'Home', icon: HomeFilled },
  { path: '/protein-info', title: 'Protein Info', icon: FirstAidKit },
  { path: '/protein-images', title: 'Protein Images', icon: Picture },
  { path: '/protein-image-submit', title: 'Submit Images', icon: Upload },
  { path: '/gene-gtp', title: 'GTP Mouse Strain', icon: Connection }
]

const activePath = computed(() => {
  if (route.path.startsWith('/protein-info')) {
    return '/protein-info'
  }
  if (route.path.startsWith('/protein-images')) {
    return '/protein-images'
  }
  if (route.path.startsWith('/protein-image-submit')) {
    return '/protein-image-submit'
  }
  if (route.path.startsWith('/gene-gtp')) {
    return '/gene-gtp'
  }
  return '/home'
})
</script>

<style scoped>
.admin-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 0 6px;
}

.side-menu {
  flex: 1;
  border-right: none;
  background: #fff;
  --el-menu-text-color: var(--text-2);
  --el-menu-hover-text-color: var(--text-1);
  --el-menu-bg-color: #fff;
  --el-menu-hover-bg-color: var(--fill-2);
  --el-menu-active-color: var(--primary);
  --el-menu-item-height: 44px;
}

.side-menu :deep(.el-menu-item) {
  margin: 0;
  color: var(--text-2);
}

.side-menu :deep(.el-menu-item.is-active) {
  background: var(--primary-light) !important;
  color: var(--primary) !important;
  font-weight: 500;
}

.side-menu:not(.el-menu--collapse) {
  width: 220px;
}
</style>
