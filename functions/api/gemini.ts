/**
 * Cloudflare Functions - Gemini API 代理
 * 用途：安全地代理前端到 Google Gemini API 的请求，保护 API Key
 */

interface Env {
    GEMINI_API_KEY: string;
}

interface RequestContext {
    request: Request;
    env: Env;
}

export const onRequestPost = async (context: RequestContext) => {
    const { request, env } = context;

    // CORS 头部设置
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 从环境变量读取 API Key（安全！）
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'API Key not configured' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 解析前端请求
        const body = await request.json();
        const { model, contents, config } = body;

        if (!model || !contents) {
            return new Response(
                JSON.stringify({ error: 'Invalid request: model and contents are required' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 构建 Gemini API URL
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // 构建请求体
        const geminiRequestBody: any = {
            contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
        };

        // 添加可选配置
        if (config) {
            if (config.responseMimeType) {
                geminiRequestBody.generationConfig = geminiRequestBody.generationConfig || {};
                geminiRequestBody.generationConfig.responseMimeType = config.responseMimeType;
            }
            if (config.responseSchema) {
                geminiRequestBody.generationConfig = geminiRequestBody.generationConfig || {};
                geminiRequestBody.generationConfig.responseSchema = config.responseSchema;
            }
            if (config.tools) {
                geminiRequestBody.tools = config.tools;
            }
            if (config.systemInstruction) {
                geminiRequestBody.systemInstruction = {
                    parts: [{ text: config.systemInstruction }]
                };
            }
            if (config.responseModalities) {
                geminiRequestBody.generationConfig = geminiRequestBody.generationConfig || {};
                geminiRequestBody.generationConfig.responseModalities = config.responseModalities;
            }
            if (config.speechConfig) {
                geminiRequestBody.generationConfig = geminiRequestBody.generationConfig || {};
                geminiRequestBody.generationConfig.speechConfig = config.speechConfig;
            }
        }

        console.log('[Cloudflare Function] Request config:', {
            hasResponseMimeType: !!config?.responseMimeType,
            hasResponseSchema: !!config?.responseSchema,
            model
        });

        // 转发请求到 Gemini API
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geminiRequestBody),
        });

        const geminiData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini API Error:', geminiData);
            return new Response(
                JSON.stringify({
                    error: 'Gemini API Error',
                    details: geminiData
                }),
                {
                    status: geminiResponse.status,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 返回成功响应
        return new Response(
            JSON.stringify(geminiData),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error: any) {
        console.error('Proxy Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
};
