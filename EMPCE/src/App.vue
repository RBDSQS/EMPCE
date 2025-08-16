<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const isLoginPage = computed(() => route.name === 'login')

// 退出：清 token 并回登录页
const logout = () => {
  localStorage.removeItem('token')
  router.replace({ name: 'login' })
}
</script>

<template>
  <!-- 不在登录页才显示头部/导航 -->
  <header v-if="!isLoginPage" class="app-header">
    <nav class="nav">
      <RouterLink to="/" class="link">Home</RouterLink>
      <RouterLink to="/about" class="link">About</RouterLink>
      <button class="logout" @click="logout">退出</button>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.app-header { display:flex; justify-content:center; padding:12px 16px; border-bottom:1px solid #eee; }
.nav { display:flex; gap:12px; align-items:center; }
.link { text-decoration:none; padding:6px 10px; border-radius:8px; border:1px solid #eee; }
.logout { padding:6px 10px; border-radius:8px; border:1px solid #eee; background:transparent; cursor:pointer; }
</style>
