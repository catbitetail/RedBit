<div align="center">
  <!-- 
    Responsive Logo / 响应式 Logo
    GitHub will automatically switch between these two images based on the user's theme settings.
    Please ensure 'redbit-full-light.png' and 'redbit-full-dark.png' exist in your 'public/' directory.
  -->
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/redbit-full-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="public/redbit-full-light.png">
    <img alt="RedBit 赤兔" src="public/redbit-full-light.png" width="380">
  </picture>

  <br/><br/>

  # RedBit 赤兔
  
  **日行千里，深挖红海**
  <br>
  *Travels a thousand miles a day, mining the Red Ocean.*

  <br/>

  [![License: MIT](https://img.shields.io/badge/License-MIT-rose.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
  [![Powered by](https://img.shields.io/badge/Powered%20by-Gemini%203.0-orange.svg)](https://deepmind.google/technologies/gemini/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📖 缘起 (Origin)

**赤兔 (RedBit)** 之名，取自“人中吕布，马中赤兔”。
在古典语境中，它是速度与耐力的象征；在数字红海（Red Ocean）中，它是**RedBit**——以比特为蹄，极速跨越海量非结构化数据。

这是一个基于 **Google Gemini 3.0** 构建的新媒体数据挖掘引擎。它不旨在替代人类的思考，而是作为那匹不知疲倦的“战马”，助你在小红书（Xiaohongshu）庞杂的评论区中，极速提炼出用户痛点、情绪光谱与市场洞察。

科技的理性逻辑，蕴含着对人性的东方洞察。

## ✨ 核心特性 (Features)

RedBit 将杂乱的自然语言转化为结构化的商业智慧：

*   **🐎 日行千里 (Instant Insight)**
    *   **“课代表”总结**：瞬间提炼评论区核心论点、争议焦点与神回复，支持 TTS 情感化语音播报。
    *   **全观点聚类**：不仅仅是总结，更是将数百条碎片化观点按“信息价值”自动分层与归类。

*   **👁️ 洞若观火 (Deep Vision)**
    *   **情绪雷达**：量化焦虑、治愈、炫耀等七种微妙情绪，绘制情感光谱。
    *   **人群侧写**：基于语义推断用户画像（Persona）与潜在需求。

*   **🎨 东方美学 (Aesthetics)**
    *   **沉浸式 UI**：融合玻璃拟态 (Glassmorphism) 与水墨色调，支持动态花瓣/雪花粒子特效。
    *   **完美输出**：解决了 Canvas 渲染难题，支持生成 A4 排版级别的 PDF 深度挖掘报告。

*   **🧠 智者千虑 (AI Reasoning)**
    *   **思维链 (CoT)**：利用 Gemini 3.0 的推理能力，而非简单的关键词匹配。
    *   **本地备份**：支持 JSON 格式的数据持久化与回溯，数据掌握在自己手中。

## 🛠️ 技术栈 (Tech Stack)

项目采用现代化的纯前端架构 (SPA)，轻量、隐私、易于扩展。

*   **Core**: React 19 + TypeScript + Vite
*   **AI Engine**: Google Gemini API (`gemini-3-flash`, `gemini-2.5-flash-tts`)
*   **State**: Context API (Theme/Language)
*   **Styling**: Tailwind CSS + Custom Animations
*   **Visualization**: Recharts (Radar/Bar), D3.js (WordCloud)
*   **Export**: html2canvas + jsPDF (Custom Rendering Pipeline)

## 🚀 快速开始 (Getting Started)

### 前置要求
*   Node.js (v18+)
*   Google Gemini API Key

### 安装与运行

1.  **克隆仓库**
    ```bash
    git clone https://github.com/yourusername/redbit.git
    cd redbit
    ```

2.  **安装依赖**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **配置环境**
    在根目录创建 `.env` 文件，填入你的 API Key：
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **启动引擎**
    ```bash
    npm run dev
    ```

## 🗺️ 路线图 (Roadmap)

我们相信“慢即是快”，扎实推进每一个功能的深度。

- [x] **v1.0 MVP**: 文本/图片分析、情绪雷达、PDF 导出、多语言支持。
- [ ] **v1.1 Grounding**: 增强 Google Search Grounding 能力，提升链接解析成功率。
- [ ] **v1.2 Batch**: 批量笔记对比分析，竞品监控仪表盘。
- [ ] **v2.0 Extension**: Chrome 插件化，实现“在此处挖掘”的无缝体验。

## 🤝 贡献 (Contributing)

RedBit 是一个开源项目，我们欢迎任何形式的贡献。无论是代码优化、Prompt 调优，还是对 UI 细节的打磨。

请遵循 `Pull Request` 流程，并确保代码风格的一致性。

## 📄 协议 (License)

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">
  <sub>Made with ❤️ and 🍵 by the RedBit Team.</sub>
</div>
