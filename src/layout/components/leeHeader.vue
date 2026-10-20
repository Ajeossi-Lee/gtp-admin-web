<template>
  <div class="admin-header-bar">
    <div class="brand" :class="{ collapsed }" @click="router.push('/home')">
      <svg width="26" height="26" viewBox="0 0 26 26">
        <path d="M13 1.6 24.4 21.2H1.6L13 1.6z" fill="#165DFF" transform="rotate(180 13 11.4)" />
        <path d="M13 24.4 7.6 15h10.8L13 24.4z" fill="#165DFF" opacity=".55" />
      </svg>
      <span v-show="!collapsed" class="brand-name">GTP Admin</span>
    </div>
    <button
      type="button"
      class="collapse-btn"
      :title="collapsed ? 'Expand menu' : 'Collapse menu'"
      @click="$emit('toggle-collapse')"
    >
      <MenuUnfoldOne v-if="collapsed" theme="outline" size="18" fill="#4E5969" />
      <MenuFoldOne v-else theme="outline" size="18" fill="#4E5969" />
    </button>
    <div class="header-right">
      <div class="search-box">
        <span>Search</span>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#4E5969" stroke-width="1.5">
          <circle cx="7" cy="7" r="4.6" />
          <path d="M10.6 10.6 14 14" stroke-linecap="round" />
        </svg>
      </div>
      <div class="hdr-icons">
        <button
          type="button"
          class="hdr-icon"
          :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
          @click="toggleFullscreen"
        >
          <OffScreen v-if="isFullscreen" theme="outline" size="18" fill="#4E5969" />
          <FullScreen v-else theme="outline" size="18" fill="#4E5969" />
        </button>
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="avatar">{{ avatarText }}</div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FullScreen, MenuFoldOne, MenuUnfoldOne, OffScreen } from '@icon-park/vue-next'
import '@icon-park/vue-next/styles/index.css'
import useUserStore from '@/store/modules/user'
import { toast } from '@/utils/tools'

defineOptions({
  name: 'LeeHeader'
})

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  (e: 'toggle-collapse'): void
}>()

const router = useRouter()
const userStore = useUserStore()
const isFullscreen = ref(false)

const avatarText = computed(() => (userStore.displayName || 'A').slice(0, 1))

const getFullscreenElement = () =>
  document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement

const syncFullscreen = () => {
  isFullscreen.value = Boolean(getFullscreenElement())
}

const toggleFullscreen = async () => {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void
  }
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
  }

  if (getFullscreenElement()) {
    await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())
  } else {
    await (root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.())
  }
}

onMounted(() => {
  syncFullscreen()
  document.addEventListener('fullscreenchange', syncFullscreen)
  document.addEventListener('webkitfullscreenchange', syncFullscreen)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  document.removeEventListener('webkitfullscreenchange', syncFullscreen)
})

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await userStore.logout()
    toast('Logged out')
    router.push({ name: 'Login' })
  }
}
</script>

<style scoped>
.admin-header-bar {
  height: 60px;
  display: flex;
  align-items: center;
}

.brand {
  width: 220px;
  height: 100%;
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  padding-left: 22px;
  overflow: hidden;
  cursor: pointer;
  transition: width 0.2s;
}

.brand.collapsed {
  width: 64px;
  padding-left: 0;
  justify-content: center;
}

.brand-name {
  color: var(--text-1);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.collapse-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 12px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
}

.collapse-btn:hover {
  background: var(--fill);
}

.header-right {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-right: 20px;
}

.search-box {
  width: 196px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 12px;
  border-radius: 16px;
  background: rgba(242, 243, 245, 0.75);
}

.search-box span {
  flex: 1;
  color: var(--text-3);
  font-size: 13px;
}

.hdr-icons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hdr-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
}

.hdr-icon:hover {
  background: var(--fill);
}

.avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e8bff, #165dff);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
}
</style>
