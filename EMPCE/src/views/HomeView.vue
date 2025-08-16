<script setup lang="ts">
import { ElMessage } from 'element-plus'

const logout = () => {
  localStorage.removeItem('token')
  ElMessage.success('已退出')
  location.href = '/login'
}
</script>

<template>
  <div class="wrap">
    <header class="topbar">
      <div class="brand">
        <img src="/vite.svg" alt="logo" />
        <span>EMPCE Console</span>
      </div>
      <div class="actions">
        <el-button type="primary" plain @click="logout">退出</el-button>
      </div>
    </header>

    <section class="hero">
      <el-result icon="success" title="登录成功" sub-title="欢迎回来！开始你的工作吧～" />
    </section>
  </div>
</template>

<style scoped>
.wrap { min-height: 100vh; background: linear-gradient(180deg, #0b1023 0%, #0f172a 100%); }
.topbar {
  height: 64px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,.08); color: #e5e7eb;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; }
.brand img { width: 28px; height: 28px; }
.actions { display: flex; align-items: center; gap: 8px; }
.hero { padding: 36px 20px; color: #e5e7eb; }
</style>
