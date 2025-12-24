# ==========================================
# 阶段 1: 基础环境构建 [cite: 39]
# ==========================================
FROM node:20-alpine AS builder

# 设置容器内工作目录 [cite: 39]
WORKDIR /app

# 安装系统级依赖 [cite: 39]
# libc6-compat: 确保 sharp 等图像优化库在 Alpine 下正常运行 [cite: 39]
RUN apk add --no-cache libc6-compat git curl

# ==========================================
# 阶段 2: 依赖安装 [cite: 39, 40]
# ==========================================
# 优先复制依赖定义文件以利用 Docker 镜像层缓存 [cite: 39]
COPY package.json package-lock.json* ./

# 安装腾讯云 EdgeOne CLI 工具 [cite: 40]
RUN npm install -g edgeone

# 优化点 1: 挂载 npm 缓存目录
# target=/root/.npm 确保即使 package.json 变动，已下载的包也不会重复下载
RUN --mount=type=cache,target=/root/.npm \
    npm ci [cite: 40]

# ==========================================
# 阶段 3: 源代码构建 [cite: 40]
# ==========================================
# 复制项目所有文件 [cite: 40]
COPY . .

# 优化点 2: 挂载 Astro 构建缓存目录 [cite: 37, 40]
# target 路径必须与 astro.config.mjs 中的 cacheDir 一致
# 显著加速 "generating optimized images" 阶段
RUN --mount=type=cache,target=/app/.astro_cache \
    npm run build [cite: 40]

# ==========================================
# 阶段 4: 运行时配置 (Deploy-and-Serve 架构) [cite: 29, 41]
# ==========================================
# 设置环境变量，禁用交互模式 [cite: 41, 155]
ENV CI=true
ENV PORT=3000 [cite: 52]

# 暴露 3000 端口用于 Dokploy 健康检查与部署看板 [cite: 41, 98]
EXPOSE 3000

# 注入部署编排脚本 
COPY deploy-wrapper.cjs /app/deploy-wrapper.cjs

# 启动 Node.js 驻留进程执行上传任务 [cite: 41, 76]
CMD ["node", "/app/deploy-wrapper.cjs"]