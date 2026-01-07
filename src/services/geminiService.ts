
import { AnalysisResult, ReplySuggestion, TopicDraft } from "../types";
import { Language } from "../translations";
import { Type, Schema } from "@google/genai";

// ===============================================
// 配置：使用 Cloudflare Functions 代理
// ===============================================
const USE_CLOUDFLARE_PROXY = true; // 生产环境设置为 true
const GEMINI_PROXY_URL = "/api/gemini"; // Cloudflare Functions 代理路径
const CHAT_PROXY_URL = "/api/chat"; // 聊天代理路径

// CONFIGURATION: Set this to your local python backend if you have one running.
// Use 127.0.0.1 instead of localhost to avoid Windows IPv6 resolution issues
const BACKEND_API_URL = "http://127.0.0.1:5000/crawl";

// ===============================================
// 代理 API 调用辅助函数
// ===============================================

/**
 * 调用 Cloudflare Functions 代理
 */
const callGeminiProxy = async (model: string, contents: any, config?: any): Promise<any> => {
  if (!USE_CLOUDFLARE_PROXY) {
    throw new Error("Proxy is disabled. Please enable USE_CLOUDFLARE_PROXY.");
  }

  const response = await fetch(GEMINI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, contents, config }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[Proxy Error]', errorData);
    throw new Error(`Proxy Error: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();

  // 安全提取 text，兼容不同的响应格式
  let text = "";

  // 尝试多种可能的路径
  if (data.candidates && Array.isArray(data.candidates) && data.candidates[0]) {
    const candidate = data.candidates[0];
    if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
      text = candidate.content.parts[0]?.text || "";
    }
  }

  // 如果上面的路径都失败了，尝试直接从 data 中提取
  if (!text && data.text) {
    text = data.text;
  }

  // 如果还是没有，尝试 JSON 字符串化后提取
  if (!text && data.content) {
    text = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
  }

  console.log('[Gemini Proxy Response]', {
    hasText: !!text,
    textLength: text.length,
    hasCandidates: !!data.candidates,
    rawKeys: Object.keys(data)
  });

  // 返回包装的响应，模拟 Google GenAI SDK 的结构
  return {
    text: text,
    candidates: data.candidates || [],
    raw: data
  };
};

/**
 * 调用聊天代理 API
 */
const callChatProxy = async (action: string, model: string, config?: any, message?: string): Promise<any> => {
  if (!USE_CLOUDFLARE_PROXY) {
    throw new Error("Proxy is disabled. Please enable USE_CLOUDFLARE_PROXY.");
  }

  const response = await fetch(CHAT_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, model, config, message }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Chat Proxy Error: ${errorData.error || response.statusText}`);
  }

  return await response.json();
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    short_title: { type: Type.STRING, description: "A punchy, concise, interesting title (max 15 chars)." },
    summary: { type: Type.STRING, description: "Summary of content and atmosphere." },
    sentiment_score: { type: Type.NUMBER, description: "0.0 to 1.0" },
    emotions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          score: { type: Type.NUMBER },
          type: { type: Type.STRING, description: "One of: Anxiety, Healing, Desire, Disappointment, Humblebrag, Resonance, Other" }
        },
        required: ['label', 'score', 'type']
      }
    },
    key_insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING },
          sentiment: { type: Type.STRING, description: "positive, negative, or neutral" },
          count: { type: Type.NUMBER },
          quote: { type: Type.STRING }
        },
        required: ['point', 'sentiment', 'count', 'quote']
      }
    },
    class_rep: {
      type: Type.OBJECT,
      properties: {
        controversies: { type: Type.ARRAY, items: { type: Type.STRING } },
        info_gains: { type: Type.ARRAY, items: { type: Type.STRING } },
        god_replies: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['controversies', 'info_gains', 'god_replies']
    },
    comprehensive_viewpoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category_name: { type: Type.STRING },
          viewpoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                value_score: { type: Type.NUMBER },
                sentiment: { type: Type.STRING, description: "positive, negative, or neutral" }
              },
              required: ['content', 'value_score', 'sentiment']
            }
          }
        },
        required: ['category_name', 'viewpoints']
      }
    },
    audience_profile: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['description', 'tags']
    },
    next_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
    questions_asked: { type: Type.ARRAY, items: { type: Type.STRING } },
    meme_alert: { type: Type.ARRAY, items: { type: Type.STRING } },
    competitor_weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['short_title', 'summary', 'sentiment_score', 'emotions', 'key_insights', 'class_rep', 'comprehensive_viewpoints', 'audience_profile', 'next_topics', 'questions_asked', 'meme_alert']
};

// 辅助函数：安全生成 Key Viewpoints 字符串
const generateKeyViewpointsString = (viewpoints: any[]): string => {
  if (!Array.isArray(viewpoints) || viewpoints.length === 0) {
    return "No viewpoints available";
  }

  return viewpoints
    .filter(c => c && typeof c === 'object')
    .map(c => {
      const categoryName = (c.category_name && typeof c.category_name === 'string') ? c.category_name : 'Unknown Category';
      let viewpointsList = '';

      if (Array.isArray(c.viewpoints)) {
        viewpointsList = c.viewpoints
          .filter(v => v && typeof v === 'object' && typeof v.content === 'string')
          .map(v => v.content)
          .join(', ');
      }

      return `- ${categoryName}: ${viewpointsList}`;
    })
    .join('\n');
};

/**
 * ------------------------------------------------------------------
 * STRATEGY: Backend -> Hybrid -> Search Grounding
 * ------------------------------------------------------------------
 */

const fetchFromBackend = async (url: string, cookie?: string): Promise<string | null> => {
  if (!url) return null;
  try {
    console.log(`Attempting to connect to backend: ${BACKEND_API_URL}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, cookie }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && (data.title || data.desc || data.comments)) {
      const commentsText = Array.isArray(data.comments)
        ? data.comments.join('\n')
        : JSON.stringify(data.comments);

      return `
            [SOURCE: RAW DATA FROM BACKEND CRAWLER]
            Title: ${data.title || 'N/A'}
            Description: ${data.desc || 'N/A'}
            Comments:
            ${commentsText}
            `;
    }
    return null;

  } catch (error) {
    console.warn("Backend fetch failed (falling back to frontend search):", error);
    return null;
  }
};

const fetchContentFromUrl = async (url: string, cookie?: string): Promise<string> => {
  try {
    const prompt = `
      I need to find the content of a specific Xiaohongshu (Little Red Book) post.
      Target URL: ${url}
      ${cookie ? `Context: The user provided a session cookie, but since I am using Google Search Grounding, I cannot apply it directly. Please find the public version.` : ''}

      Instructions:
      1. This might be a short link (xhslink.com). It redirects to a normal note.
      2. Use Google Search to find the *Title* and *Caption/Body* of the post.
      3. Look for user comments if visible.
      4. If the exact post content is not indexed, look for cached versions or mentions of this specific URL.
      5. CRITICAL: If you absolutely cannot find the content (e.g. only login page), return "ERROR_CONTENT_UNAVAILABLE". Do not hallucinate a post.
    `;

    const response = await callGeminiProxy(
      "gemini-3-flash-preview",
      prompt,
      {
        tools: [{ googleSearch: {} }]
      }
    );

    const text = response.text || "";
    if (text.includes("ERROR_CONTENT_UNAVAILABLE")) {
      throw new Error("CONTENT_NOT_INDEXED");
    }
    return text;
  } catch (error: any) {
    if (error.message === "CONTENT_NOT_INDEXED") throw error;
    console.warn("URL Fetch Warning:", error);
    return "";
  }
};

// 1. OCR / Extract Text from Image
export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await callGeminiProxy(
      "gemini-3-flash-preview",
      {
        parts: [
          { inlineData: { mimeType: "image/png", data: base64Image } },
          { text: "Extract all the comment text from this screenshot. Ignore UI elements like timestamps or buttons. Just return the raw text of the comments line by line." }
        ]
      }
    );
    return response.text || "";
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from image.");
  }
};

// 2. Main Analysis with Thinking Mode
export const analyzeComments = async (input: string, language: Language = 'zh', cookie?: string): Promise<AnalysisResult> => {
  try {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex);
    const hasUrl = !!urls && urls.length > 0;

    const textWithoutUrl = input.replace(urlRegex, '').trim();
    // Keep textWithoutUrl for fallback, even if short
    const hasSignificantText = textWithoutUrl.length > 20; // Lowered threshold slightly

    let contentToAnalyze = input;
    let backendData: string | null = null;

    if (hasUrl) {
      const targetUrl = urls![0];
      if (cookie || targetUrl) {
        backendData = await fetchFromBackend(targetUrl, cookie);
      }

      if (backendData) {
        if (hasSignificantText) {
          contentToAnalyze = `
                === USER PROVIDED TEXT (PRIORITY) ===
                ${textWithoutUrl}

                === BACKEND CRAWLER DATA (SUPPLEMENTARY) ===
                ${backendData}
                `;
        } else {
          contentToAnalyze = backendData;
        }
      } else {
        if (hasSignificantText) {
          try {
            const fetched = await fetchContentFromUrl(targetUrl, cookie);
            if (fetched && fetched.length > 50) {
              contentToAnalyze = `
                        === USER PROVIDED TEXT (PRIORITY) ===
                        ${textWithoutUrl}
                        
                        === SEARCH RESULTS (SUPPLEMENTARY) ===
                        ${fetched}`;
            } else {
              contentToAnalyze = textWithoutUrl;
            }
          } catch (e) {
            console.warn("Search grounding failed, falling back to raw user text");
            contentToAnalyze = textWithoutUrl;
          }
        } else {
          try {
            const urlInfo = await fetchContentFromUrl(targetUrl, cookie);
            contentToAnalyze = `(Source: Content found via Search for ${targetUrl})\n${urlInfo}`;
          } catch (e: any) {
            if (e.message === "CONTENT_NOT_INDEXED") {
              throw new Error("URL_NOT_INDEXED");
            }
            throw new Error("Failed to fetch URL content.");
          }
        }
      }
    }

    const languageMap = {
      en: "English",
      zh: "Simplified Chinese (简体中文)",
      ja: "Japanese",
      ko: "Korean"
    };
    const targetLang = languageMap[language] || languageMap['zh'];

    const prompt = `
      Analyze the following Xiaohongshu (Little Red Book) content.
      
      CONTEXT: The content might be raw JSON data, user-pasted text (comments/posts), or search results.
      
      ROLES:
      1. For Summary/Sentiment/Audience Profile: Act as a **Lead Analyst**. Synthesize trends and give high-level insights.
      2. For 'comprehensive_viewpoints': Act as a **Forensic Data Recorder**. **DO NOT SUMMARIZE**. Your goal is to extract and list **EVERY SINGLE distinct informational point** found in the text, no matter how small.
      
      INSTRUCTIONS FOR 'comprehensive_viewpoints':
      - **Granularity is key.** Do not group "shipping was slow" and "box was crushed" into "Shipping issues". They are two separate points. List them both.
      - **Exhaustiveness.** If the text contains 50 different specific observations, list all 50.
      - **Preserve Details.** Keep specific numbers, prices, brand names, locations, and specific user anecdotes.
      - **Categorize.** Group these points into relevant categories (e.g., "Product Quality", "Service", "Price/Value", "User Scenarios", "Specific Questions").
      
      IMPORTANT: Output all text fields in ${targetLang}.

      

      DATA TO ANALYZE:
      ${contentToAnalyze}
    `;

    const response = await callGeminiProxy(
      "gemini-3-flash-preview",
      prompt,
      {
        responseMimeType: "application/json",
      }
    );

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText) as AnalysisResult;

    // INJECT RAW CONTENT into the result so it can be saved and used for Q&A later
    // Fallback: If contentToAnalyze is disappointingly short but input was long, use input.
    // This protects against logic bugs where we might have accidentally stripped everything.
    const finalRawContent = (contentToAnalyze.length < input.length / 2 && input.length > 200)
      ? input
      : contentToAnalyze;

    result.raw_content = finalRawContent;

    return result;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    if (error.message === "URL_NOT_INDEXED") {
      throw error;
    }
    if (input.trim().length < 50 && input.trim().match(/^https?:\/\//)) {
      throw new Error("Unable to retrieve content. Please try pasting text/image.");
    }
    throw new Error("Failed to analyze comments. (API Error)");
  }
};

// 3. Smart Reply Generator
export const generateSmartReplies = async (comment: string, context: string, language: Language = 'zh'): Promise<ReplySuggestion[]> => {
  try {
    const languageMap = {
      en: "English",
      zh: "Simplified Chinese",
      ja: "Japanese",
      ko: "Korean"
    };
    const targetLang = languageMap[language] || languageMap['zh'];

    const prompt = `
      You are a Xiaohongshu comment assistant.
      Context/Post Content Summary: ${context}
      User Comment: "${comment}"
      
      Generate 3 distinct reply suggestions in ${targetLang} with different personas:
      1. Gentle/Empathetic (温柔知心)
      2. Witty/Savage (毒舌/幽默)
      3. Professional/Expert (专业干货)

      Return JSON:
      [
        {"tone": "Gentle", "reply": "..."},
        {"tone": "Witty", "reply": "..."},
        {"tone": "Professional", "reply": "..."}
      ]
    `;

    const response = await callGeminiProxy(
      "gemini-3-flash-preview",
      prompt,
      {
        responseMimeType: "application/json",
        // 修复：移除不匹配的 responseSchema，因为返回的是简单数组而不是复杂对象
      }
    );

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Reply Gen Error:", error);
    return [];
  }
};

// 4. Topic Draft Generator
export const generateTopicDraft = async (topic: string, contextSummary: string, language: Language = 'zh'): Promise<TopicDraft> => {
  try {
    const languageMap = {
      en: "English",
      zh: "Simplified Chinese",
      ja: "Japanese",
      ko: "Korean"
    };
    const targetLang = languageMap[language] || languageMap['zh'];

    const prompt = `
          You are a top-tier Xiaohongshu (Little Red Book) content creator.
          Task: Write a complete, viral-style XHS note based on the following topic and context.
          Topic: ${topic}
          Context Background: ${contextSummary}
          Style: Use emojis profusely. Authentic, conversational tone (Gen Z style). Use short paragraphs and bullet points. Include a catchy title. Language: ${targetLang}
          Return JSON: { "title": "The Title", "content": "The full body text including hashtags." }
        `;

    const response = await callGeminiProxy(
      "gemini-3-flash-preview",
      prompt,
      {
        responseMimeType: "application/json"
      }
    );

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Draft Gen Error:", error);
    throw new Error("Failed to generate draft");
  }
};

// 5. TTS Service
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await callGeminiProxy(
      "gemini-2.5-flash-preview-tts",
      [{ parts: [{ text }] }],
      {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      }
    );

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// 6. Create Chat Session
export const createChatSession = (contextData: AnalysisResult) => {
  // Safe access with defaults
  const viewpoints = contextData.comprehensive_viewpoints || [];
  const emotions = contextData.emotions || [];
  const audienceDesc = contextData.audience_profile?.description || "Unknown";
  const summary = contextData.summary || "No summary available";

  // --- EXPERT PERSONA DEFINITION (From User Request) ---
  const EXPERT_PERSONA = `
# Role (角色设定)
你是一位拥有 10 年经验的“新媒体数据挖掘专家”与“资深产品经理”。你擅长从杂乱的社交媒体碎片信息中“深挖”用户真实痛点，并具备敏锐的商业嗅觉。

# Background (背景)
我将提供给你一组来自小红书（Xiaohongshu）评论区的原始文本数据。

# Objective (目标)
请分析这些评论，透过表面情绪，挖掘背后的用户需求、市场趋势及潜在槽点，并输出一份结构清晰的《用户洞察分析报告》。

# Key Constraints (关键约束)
1. 保持客观：不要过度脑补，结论必须基于提供的评论。
2. 结构化输出：严格按照下方的 [Output Format] 进行输出，不要输出无关的废话。
3. 语言风格：专业、犀利、逻辑严密，使用互联网产品术语（如：用户心智、痛点、转化障碍）。

# Output Format (输出格式 - 必须遵守)
请以 Markdown 格式输出：

## 1. 舆情概览
- **总体情感倾向**：(正面/负面/中立 的百分比预估)
- **核心关键词 Top 5**：(提取出现频率最高且有意义的词)

## 2. 深度洞察 (Deep Dive)
- **用户痛点/需求**：(总结评论中反映的 3 个主要问题或需求)
- **机会点建议**：(基于痛点，给出 1-2 个产品或内容优化的建议)

## 3. "神评论"精选 (Golden Comments)
*请挑选 3 条最有价值的评论（比如：指出了关键问题、或是文案极其精彩），并附上你的点评。*
- **原评论**：“...”
- **专家点评**：(为什么这条评论有价值？)

# Let's think step by step (思维链)
在生成报告前，请先在内心把所有评论通读一遍，进行分类聚类，排除无效的水军评论，再开始撰写报告。
`;

  // Combine Persona with Data
  let contextString = `${EXPERT_PERSONA}\n\n`;

  // INJECT RAW CONTENT IF AVAILABLE (Backward compatibility: check if it exists)
  if (contextData.raw_content) {
    contextString += `
        # DATA PROVIDED FOR ANALYSIS (原始数据)
        === START OF COMMENTS / POST DATA ===
        ${contextData.raw_content}
        === END OF COMMENTS / POST DATA ===
        
        Note: The above is the raw user-provided content. Please strictly base your report on this data.
        `;
  } else {
    contextString += `
        # DATA PROVIDED FOR ANALYSIS (Summary Data only)
        Note: Raw content is not available for this report. Please base your expert report on the following structured summary:
        
        Summary: ${summary}
        Key Viewpoints:
        ${generateKeyViewpointsString(viewpoints)}
        `;
  }

  contextString += `\nIf the user asks follow-up questions after the report, continue acting as the \"Social Media Data Mining Expert\".`;

  // 返回一个聊天会话对象，包含 sendMessage 方法
  return {
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: contextString
    },
    sendMessage: async (params: { message: string }) => {
      const response = await callChatProxy(
        'sendMessage',
        'gemini-3-flash-preview',
        { systemInstruction: contextString },
        params.message
      );
      return {
        text: response.text || ''
      };
    }
  };
};
