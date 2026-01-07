#  Cloudflare Pages 部署指南

##  项目状态: 构建成功
```bash
npm run build  #  已通过测试
```

##  快速部署步骤

### 1. GitHub自动部署（推荐）
1. 推送代码到GitHub
2. 访问 https://dash.cloudflare.com/
3. Workers & Pages  Create  Pages  Connect to Git
4. 构建配置:
   - Framework: Vite
   - Build command: npm run build
   - Output directory: dist
5. 环境变量: VITE_GEMINI_API_KEY = your_api_key

### 2. 本地开发
```bash
cp .env.example .env  # 配置API Key
npm install
npm run dev
```

##  已知限制
1. 聊天图片上传暂时禁用（SDK API需更新）
2. URL抓取依赖Google Search（成功率较低）
3. API Key暴露在客户端（建议用Workers代理）

详见完整文档: https://developers.cloudflare.com/pages/
