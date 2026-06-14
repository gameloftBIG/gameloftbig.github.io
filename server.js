const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// 设置CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// 执行Git命令
app.post('/git', (req, res) => {
  const { command } = req.body;
  
  // 安全检查：只允许Git命令
  if (!command.startsWith('git ')) {
    return res.json({ success: false, error: '只允许执行Git命令' });
  }
  
  exec(command, { cwd: path.join(__dirname) }, (error, stdout, stderr) => {
    if (error) {
      return res.json({ 
        success: false, 
        error: stderr || error.message 
      });
    }
    res.json({ success: true, output: stdout || stderr });
  });
});

// 提供静态文件
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`✅ Git管理服务器已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🌐 访问面板: http://localhost:${PORT}/git-panel.html`);
});