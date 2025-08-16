下面是给你后端同学（也是初学者）能看懂、能跑的 **README**。思路是：前端（你这套 Vue3 + Vite）不直接连数据库，我们用一个**最小 Django 后端**连上 **SQLite**（开发环境自带的轻量数据库），并开放一个 `/api/events/` 接口给前端调通。整套流程 20 分钟可跑通。

---

# EMPCE 前后端联调（入门版）

> 前端：Vite + Vue3 + TS + Vue Router + Element Plus
> 后端：Django + Django REST framework（DRF）+ SQLite（开发）

## 0. 准备

* Node.js ≥ 18，Python ≥ 3.10
* 你收到的是**源码**（不会包含 `node_modules/`），安装依赖用：

  ```bash
  npm ci
  npm run dev
  ```

  使用 `npm ci` 能严格按锁文件安装、可复现依赖树。
* Vite 只会把以 **`VITE_`** 开头的变量注入到前端，通过 `import.meta.env` 读取。([vitejs][1])

---

## 1. 前端（你现在这套）

1. 在项目根目录复制环境变量：

```bash
cp .env.example .env
```

2. 打开 `.env`（没有就新建），写上你本机后端地址（后面我们会起 8000 端口）：

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

说明：Vite 只暴露 `VITE_` 前缀变量，代码里通过 `import.meta.env.VITE_API_BASE_URL` 读到。([vitejs][1])

3. 确认前端的 `src/api/http.ts`（或同等文件）用到了这个变量，例如：

```ts
import axios from 'axios'
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})
```

这是 Axios 官方建议的“实例化”写法，便于统一配置 baseURL、超时等。([axios-http.com][2])

> 先别跑前端，等后端起好再同时启动。

---

## 2. 后端（最小可用 API + 连接 SQLite）

> 目标：本地启动 Django，自动连接 SQLite（开发默认），提供 `/api/events/` 的增删改查。
> SQLite 是零配置内嵌数据库，Django 默认就支持，特别适合入门联调。([Django Project][3])

### 2.1 创建与安装

```bash
# 新建后端目录
mkdir backend && cd backend

# 可选：创建虚拟环境（推荐）
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 安装 Django + DRF + CORS
pip install django djangorestframework django-cors-headers
```

### 2.2 初始化 Django 工程与应用

```bash
django-admin startproject config .
python manage.py startapp events
```

（Django 官方教程：用 `startproject` 创建项目、`runserver` 开发运行。([Django Project][3])）

### 2.3 配置 `settings.py`

编辑 `config/settings.py`：

```py
INSTALLED_APPS = [
    # 第三方
    'corsheaders',
    'rest_framework',
    # 内置
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 你的 app
    'events',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 放在靠前位置
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
]

# 只允许本机前端（开发环境）
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

> 说明：`django-cors-headers` 用于解决前端跨域，建议**白名单域名**而非全放开。([PyPI][4], [freecodecamp.org][5], [StackHawk, Inc.][6])

### 2.4 定义一个最简单的表（模型）

`events/models.py`：

```py
from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

### 2.5 序列化 + 视图（用 DRF 快速生成接口）

`events/serializers.py`：

```py
from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
```

`events/views.py`：

```py
from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
```

`config/urls.py`：

```py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from events.views import EventViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

> 以上写法参考 DRF Quickstart：用 `DefaultRouter + ModelViewSet` 就能获得标准的 REST 接口。([Django REST Framework][7])

### 2.6 迁移并启动（会自动创建 SQLite 数据库）

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 8000
# 如需局域网给同事预览：python manage.py runserver 0.0.0.0:8000
```

（`runserver` 可绑定指定端口/地址，0.0.0.0 允许局域网访问。([Django Project][8])）

此时后端就绪：

* 列表接口：`http://127.0.0.1:8000/api/events/`
* 可在管理后台新增数据（可选）：先 `python manage.py createsuperuser`，再访问 `/admin/`。

---

## 3. 联调：让前端真的“读到数据库里的数据”

1. 在前端项目根目录：

```bash
npm ci
npm run dev
```

2. 在你任意页面（比如 `HomeView.vue`）加一段最小读取逻辑测试：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'        // 就是前面用 axios.create 的实例
const events = ref<any[]>([])

onMounted(async () => {
  const { data } = await api.get('/events/')  // 注意：baseURL 里已经有 /api
  events.value = data
})
</script>

<template>
  <ul>
    <li v-for="e in events" :key="e.id">{{ e.title }} - {{ e.date }}</li>
  </ul>
</template>
```

3. 打开浏览器看页面是否渲染出列表；若为 `[]`，在后端 `/admin/` 或通过 `POST /api/events/` 先加几条数据再刷新试试。

---

## 4. 常见卡点（两分钟排查）

* **前端 404 / CORS 报错**

  * 确认后端真的跑在 `127.0.0.1:8000`；
  * 确认 `CORS_ALLOWED_ORIGINS` 包含 `5173` 的前端地址；**不要**一把梭 `CORS_ALLOW_ALL_ORIGINS=True` 上生产。([PyPI][4], [freecodecamp.org][5])
* **`import.meta.env` 读不到值**

  * 变量名必须以 `VITE_` 开头，代码用 `import.meta.env.变量名` 访问。([vitejs][1])
* **Axios 没走到你设的 baseURL**

  * 确认用的是 `axios.create({ baseURL })` 实例，并从这个实例发请求。([axios-http.com][2])

---

## 5. 目录与提交约定

* 不提交 `node_modules/`（体积大且可复现），团队统一用 `npm ci` 安装；
* 提交 `package-lock.json`，保证大家装到**相同**依赖树；
* `.env.example` 提供示例，真实 `.env` 自己本地维护。

---

## 6. 下一步（可选）

* 把登录页对接后端真实登录接口（`/api/login/`）并把返回的 Token 放到请求头（在 Axios 拦截器统一设置）。([axios-http.com][9])
* 如果最终生产不是根路径部署，Vite 需要设置 `base`（部署时再说）。

---

### 附：为什么这样设计？

* 前端通过 **`VITE_` 前缀的环境变量**配置后端地址，避免写死；这是 Vite 的官方模式。([vitejs][1])
* 后端选 **Django + DRF + SQLite**，因为**零配置数据库** + **快速生成 REST**，非常适合入门联调；DRF 官方 Quickstart 就是用 `ViewSet + Router`。([Django Project][3], [Django REST Framework][7])
* 跨域用 `django-cors-headers`，**只允许开发域名**，安全又简单。([PyPI][4], [freecodecamp.org][5])

---

需要我把这个 README 连同 \*\*后端最小工程的 5 个文件（models/serializers/views/urls/settings 片段）\*\*打成一个压缩包示例吗？我也可以把你前端里的 `http.ts` 和一个简单的 `HomeView.vue` 列表页替换成上面的“可直接请求”的版本。

[1]: https://vite.dev/guide/env-and-mode?utm_source=chatgpt.com "Env Variables and Modes"
[2]: https://axios-http.com/docs/instance?utm_source=chatgpt.com "The Axios Instance | Axios Docs"
[3]: https://docs.djangoproject.com/en/5.2/intro/tutorial01/?utm_source=chatgpt.com "Writing your first Django app, part 1"
[4]: https://pypi.org/project/django-cors-headers/?utm_source=chatgpt.com "django-cors-headers"
[5]: https://www.freecodecamp.org/news/how-to-enable-cors-in-django/?utm_source=chatgpt.com "How to Enable CORS in Django"
[6]: https://www.stackhawk.com/blog/django-cors-guide/?utm_source=chatgpt.com "Django CORS Guide: What It Is and How to Enable It"
[7]: https://www.django-rest-framework.org/tutorial/quickstart/?utm_source=chatgpt.com "Quickstart"
[8]: https://docs.djangoproject.com/en/1.8/intro/tutorial01/?utm_source=chatgpt.com "Writing your first Django app, part 1"
[9]: https://axios-http.com/docs/config_defaults?utm_source=chatgpt.com "Config Defaults | Axios Docs"
