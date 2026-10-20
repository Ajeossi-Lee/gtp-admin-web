<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-visual">
        <img :src="loginVisual" alt="" />
      </div>

      <div class="login-main">
        <!-- <div class="login-brand">
          <svg width="22" height="22" viewBox="0 0 26 26">
            <path d="M13 1.6 24.4 21.2H1.6L13 1.6z" fill="#165DFF" transform="rotate(180 13 11.4)" />
            <path d="M13 24.4 7.6 15h10.8L13 24.4z" fill="#165DFF" opacity=".55" />
          </svg>
          <span>GTP Admin</span>
        </div> -->

        <div class="login-heading">
          <h1>GTP Admin</h1>
          <p>Please sign in to continue</p>
        </div>

        <el-form ref="formRef" class="login-form" :model="form" :rules="rules" label-position="top"
          hide-required-asterisk @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <template #label>
              <span class="field-label">
                <IconUser theme="outline" size="14" fill="currentColor" />
                Account
              </span>
            </template>
            <el-input v-model="form.username" placeholder="Enter your account" maxlength="50" autocomplete="username" />
          </el-form-item>

          <el-form-item prop="password">
            <template #label>
              <span class="field-label">
                <IconLock theme="outline" size="14" fill="currentColor" />
                Password
              </span>
            </template>
            <el-input v-model="form.password" type="password" placeholder="Enter your password" maxlength="20" show-password
              autocomplete="current-password" />
          </el-form-item>

          <div class="forgot-row">
            <button type="button" class="forgot-btn" @click="handleForgot">Forgot password?</button>
          </div>

          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            Sign in
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { toast } from '@/utils/tools'
import { User as IconUser, Lock as IconLock } from '@icon-park/vue-next'
import '@icon-park/vue-next/styles/index.css'
import loginVisual from '@/assets/images/login-visual-tubes.png'

defineOptions({
  name: 'LoginIndex'
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  loading.value = true
  try {
    await userStore.login({
      username: form.username.trim(),
      password: form.password
    })
    toast('Signed in successfully')
    const redirect = (route.query.redirect as string) || '/home'
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  toast('Please contact the administrator to reset your password', 'info')
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-size: 14px;
  background:
    radial-gradient(circle at 12% 18%, rgba(22, 93, 255, 0.08), transparent 34%),
    radial-gradient(circle at 88% 82%, rgba(64, 128, 255, 0.1), transparent 32%),
    linear-gradient(180deg, #f6f7fb 0%, #f3f4f8 100%);
}

.login-card {
  width: 720px;
  height: 420px;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(29, 33, 41, 0.06);
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(29, 52, 110, 0.1);
}

.login-visual {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #e8f3ff;
}

.login-visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.login-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 32px;
  background: #fff;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: var(--text-1);
  font-size: 15px;
  font-weight: 600;
}

.login-heading {
  margin-bottom: 30px;
}

.login-heading h1 {
  margin: 0;
  color: var(--text-1);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.login-heading p {
  margin: 6px 0 0;
  color: var(--text-3);
  font-size: 13px;
}

.login-form {
  width: 100%;
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-2);
  font-size: 14px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.login-form :deep(.el-form-item__label) {
  margin-bottom: 6px;
  padding: 0;
  line-height: 1;
  color: var(--text-2);
  font-weight: 500;
}

.login-form :deep(.el-input__wrapper) {
  height: 36px;
  padding: 1px 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid var(--border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #c9cdd4;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.12);
}

.login-form :deep(.el-input__inner) {
  height: 34px;
  color: var(--text-1);
  font-size: 14px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: var(--text-4);
}

.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin: -2px 0 16px;
}

.forgot-btn {
  padding: 0;
  border: none;
  background: none;
  color: var(--text-3);
  font-size: 13px;
  cursor: pointer;
}

.forgot-btn:hover {
  color: var(--primary);
}

.login-btn {
  width: 100%;
  height: 36px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    height: auto;
    grid-template-columns: 1fr;
  }

  .login-visual {
    display: none;
  }

  .login-main {
    padding: 28px 24px;
  }
}
</style>
