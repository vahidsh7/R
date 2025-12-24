/**
 * deploy-wrapper.cjs
 * 职责：执行 Astro 构建产物的上传，并启动监控看板以防容器退出 [cite: 29, 43]
 */
const { exec } = require('child_process');
const http = require('http');

// 配置参数读取 [cite: 52, 53]
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.EDGEONE_API_TOKEN;
const PROJECT = process.env.EDGEONE_PROJECT_NAME;
const DIST_DIR = './dist'; // Astro 默认构建输出目录 [cite: 54]

// 部署状态存储 [cite: 54]
let deployState = {
    status: 'PENDING', // PENDING, RUNNING, SUCCESS, FAILED
    startTime: new Date(),
    logs: [],
    exitCode: null
};

/**
 * 核心日志函数：同时输出到 Dokploy 控制台和内存看板 [cite: 55, 56, 57]
 */
function log(message, type = 'info') {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const entry = `[${timestamp}][${type.toUpperCase()}] ${message}`;

    // 关键：console.log 确保 Dokploy 的 Logs 面板能实时看到内容 
    console.log(entry);
    deployState.logs.push(entry);
}

/**
 * 执行 EdgeOne CLI 部署动作 [cite: 59]
 */
function runDeployment() {
    if (!TOKEN || !PROJECT) {
        deployState.status = 'FAILED';
        log('CRITICAL ERROR: Missing EDGEONE_API_TOKEN or EDGEONE_PROJECT_NAME env vars.', 'error');[cite: 58]
        return;
    }

    deployState.status = 'RUNNING';
    log(`Starting deployment for project: ${PROJECT}`);[cite: 59]
    log(`Target directory: ${DIST_DIR}`);[cite: 60]

    // 构造命令：使用 --force 确保非交互式执行 [cite: 60]
    const command = `edgeone pages deploy ${DIST_DIR} -n "${PROJECT}" -t "${TOKEN}" --force`;

    log('Executing EdgeOne CLI command...');[cite: 61]

    const child = exec(command, {
        env: { ...process.env },
        maxBuffer: 1024 * 1024 * 10 // 设置 10MB 缓冲区防止日志过长导致崩溃 [cite: 62]
    });

    // 实时捕获 CLI 的标准输出 [cite: 63]
    child.stdout.on('data', (data) => {
        data.toString().split('\n').forEach(line => {
            if (line.trim()) log(line.trim(), 'stdout');
        });
    });

    // 实时捕获 CLI 的错误输出 [cite: 64]
    child.stderr.on('data', (data) => {
        data.toString().split('\n').forEach(line => {
            if (line.trim()) log(line.trim(), 'stderr');
        });
    });

    // 监听任务结束 [cite: 65]
    child.on('close', (code) => {
        deployState.exitCode = code;
        if (code === 0) {
            deployState.status = 'SUCCESS';
            log('Deployment completed successfully. Your site is live on EdgeOne!');[cite: 65]
        } else {
            deployState.status = 'FAILED';
            log(`Deployment failed with exit code ${code}. Please check the logs above.`, 'error');[cite: 66]
        }
    });

    child.on('error', (err) => {
        deployState.status = 'FAILED';
        log(`Process execution error: ${err.message}`, 'error');[cite: 67]
    });
}

/**
 * 启动监控 HTTP 服务 [cite: 67]
 */
const server = http.createServer((req, res) => {
    // 1. 健康检查端点：供 Dokploy/Swarm 使用 [cite: 68]
    // 始终返回 200 以防止 Swarm 因为部署中或部署失败而重启容器，方便保留日志现场 [cite: 77]
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
        return;
    }

    // 2. 状态看板页面 [cite: 68, 73]
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Deployment: ${PROJECT}</title>
        <style>
            body { font-family: monospace; background: #121212; color: #e0e0e0; padding: 20px; line-height: 1.5; }
            .status { padding: 8px 15px; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 20px; }
            .SUCCESS { background: #2e7d32; } .FAILED { background: #c62828; } .RUNNING { background: #1565c0; } .PENDING { background: #757575; }
            .log-box { background: #000; padding: 15px; border: 1px solid #333; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
        </style>
    </head>
    <body>
        <h1>EdgeOne Pages Deployment Dashboard</h1>
        <div class="status ${deployState.status}">STATUS: ${deployState.status}</div>
        <p><b>Start Time:</b> ${deployState.startTime.toLocaleString()}</p>
        <div class="log-box">${deployState.logs.join('\n') || 'Waiting for logs...'}</div>
        <script>setTimeout(() => { if("${deployState.status}" === "RUNNING" || "${deployState.status}" === "PENDING") location.reload(); }, 3000);</script>
    </body>
    </html>`;
    res.end(html);
});

// 监听并启动任务 [cite: 73]
server.listen(PORT, () => {
    log(`Monitor server running on port ${PORT}`);[cite: 73]
    runDeployment(); // 服务器启动后立即触发部署 [cite: 73]
});

// 优雅退出处理 [cite: 74]
process.on('SIGTERM', () => {
    log('Received SIGTERM. Shutting down server...');[cite: 74]
    server.close(() => process.exit(0));[cite: 74]
});