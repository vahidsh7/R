/**
 * deploy-wrapper.cjs
 * 云合智联 - EdgeOne 部署监控服务 (增量同步版)
 */
const http = require('http');

const PORT = process.env.PORT || 3000;
const PROJECT = process.env.EDGEONE_PROJECT_NAME || 'Yunhe-Project';

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200); res.end('OK'); return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>部署状态 | ${PROJECT}</title>
            <style>
                body { font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #334155; text-align: center; width: 100%; max-width: 400px; }
                .status-badge { background: #064e3b; color: #10b981; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 1rem; display: inline-block; }
                h1 { margin: 0; font-size: 1.5rem; }
                .info { color: #94a3b8; font-size: 0.9rem; margin: 1.5rem 0; text-align: left; background: #0f172a; padding: 1rem; border-radius: 8px; }
                .footer { color: #64748b; font-size: 0.8rem; margin-top: 2rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="status-badge">● 增量同步已激活</div>
                <h1>${PROJECT}</h1>
                <div class="info">
                    • 引擎: Astro 5.0 <br>
                    • 节点: EdgeOne 全球边缘网络 <br>
                    • 状态: 仅同步变更文件 (Incremental)
                </div>
                <div class="footer">
                    杭州云合智联科技有限公司<br>
                    同步时间: ${new Date().toLocaleString('zh-CN')}
                </div>
            </div>
        </body>
        </html>
    `);
});

server.listen(PORT, () => {
    console.log(`[OK] Monitor running on port ${PORT}`);
});