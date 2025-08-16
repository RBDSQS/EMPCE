<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ email: '', password: '' })

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少 6 位字符', trigger: 'blur' }
  ]
}

const onSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    // TODO：这里替换为你的真实登录请求（如 await http.post('/login', form)）
    await new Promise(r => setTimeout(r, 700))
    localStorage.setItem('token', 'demo_token')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="screen">
    <div class="glass" v-loading="loading">
      <div class="header">
        <img class="logo" src="/vite.svg" alt="logo" />
        <h1>Welcome back</h1>
        <p>登录你的账号继续</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="name@example.com" :prefix-icon="User" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="至少 6 位"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-button type="primary" size="large" class="submit" @click="onSubmit">
          登录
        </el-button>
      </el-form>

      <div class="foot">
        <span>忘记密码？</span>
        <a href="javascript:void(0)">联系管理员</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(1200px 600px at 10% 10%, rgba(126, 87, 194, .20), transparent 60%),
    radial-gradient(900px 500px at 90% 30%, rgba(79, 195, 247, .18), transparent 60%),
    linear-gradient(135deg, #0f172a 0%, #0b1023 100%);
  padding: 24px;
}
.glass {
  width: 100%;
  max-width: 480px;
  padding: 28px 28px 22px;
  border-radius: 18px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(10px);
  color: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
}
.header { text-align: center; margin-bottom: 16px; }
.logo { width: 56px; height: 56px; margin-bottom: 8px; filter: drop-shadow(0 6px 12px rgba(0,0,0,.25)); }
.header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; }
.header p { margin: 0; opacity: .8; }
.form :deep(.el-form-item__label) { color: #e5e7eb; }
.submit { width: 100%; margin-top: 4px; }
.foot {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  opacity: .85;
}
.foot a { color: #93c5fd; text-decoration: none; }
</style>
