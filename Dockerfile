# ==========================================
# 阶段 1: 基础环境构建
# ==========================================
FROM node:20-alpine AS builder

# 设置容器内工作目录
WORKDIR /app

# 安装系统级依赖
# libc6-compat: 确保 sharp 等图像优化库在 Alpine 下正常运行
RUN apk add --no-cache libc6-compat git curl

# ==========================================
# 阶段 2: 依赖安装
# ==========================================
# 优先复制依赖定义文件以利用 Docker 镜像层缓存
COPY package.json package-lock.json* ./

# 安装腾讯云 EdgeOne CLI 工具
RUN npm install -g edgeone

# 优化点 1: 挂载 npm 缓存目录以加速依赖安装
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ==========================================
# 阶段 3: 源代码构建
# ==========================================
# 复制项目所有文件
COPY . .

# 优化点 2: 挂载 Astro 构建缓存目录
# 注意：此处的 target 路径必须与您的 astro.config.mjs 中的 cacheDir 一致
RUN --mount=type=cache,target=/app/.astro_cache \
    npm run build

# ==========================================
# 阶段 4: 运行时配置 (Deploy-and-Serve 架构)
# ==========================================
# 设置环境变量
ENV CI=true
ENV PORT=3000

# 暴露 3000 端口用于 Dokploy 健康检查与部署看板
EXPOSE 3000

# 注入部署编排脚本
COPY deploy-wrapper.cjs /app/deploy-wrapper.cjs

# 启动 Node.js 驻留进程执行上传任务
CMD ["node", "/app/deploy-wrapper.cjs"]