import { defineStore } from 'pinia'
import { ref } from 'vue'
import { localCache } from '@/utils/cache'

const useConfigStore = defineStore('config', () => {
  const isGetUserInfo = ref(false)

  const dark = ref(false)
  const languageInit = 'en'
  const asideWidth = ref('220px')

  const asideDynamicWidth = ref('220px')
  const handleAsideDynamicWidth = (val: string) => {
    asideDynamicWidth.value = val === 'zhCn' ? '200px' : '220px'
  }

  const language = ref(languageInit)
  localCache.setCache('localeLang', 'en')
  const handleLanguage = () => {
    language.value = 'en'
    localCache.setCache('localeLang', 'en')
  }

  // Toggle page loading on route change
  const pageLoading = ref(false)

  const handlePageLoading = (val: boolean) => {
    pageLoading.value = val
  }

  return {
    dark,
    asideWidth,
    isGetUserInfo,
    language,
    handleLanguage,
    asideDynamicWidth,
    handleAsideDynamicWidth,
    pageLoading,
    handlePageLoading
  }
})

export default useConfigStore
