/**
 * Cloudflare Functions - Gemini Chat API 代理
 * 用途：处理聊天会话的创建和消息发送
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

        const body = await request.json();
        const { action, model, config, message } = body;

        // 根据不同的操作类型处理
        if (action === 'create') {
            // 创建聊天会话（只返回配置信息）
            return new Response(
                JSON.stringify({
                    success: true,
                    sessionId: crypto.randomUUID(),
                    model: model || 'gemini-3-flash-preview',
                    config: config
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        } else if (action === 'sendMessage') {
            // 发送消息到 Gemini
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const geminiRequestBody: any = {
                contents: [{ parts: [{ text: message }] }],
            };

            // 添加系统指令
            if (config?.systemInstruction) {
                geminiRequestBody.systemInstruction = {
                    parts: [{ text: config.systemInstruction }]
                };
            }

            const geminiResponse = await fetch(geminiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(geminiRequestBody),
            });

            const geminiData = await geminiResponse.json();

            if (!geminiResponse.ok) {
                console.error('Gemini Chat API Error:', geminiData);
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

            // 提取回复文本
            const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return new Response(
                JSON.stringify({
                    success: true,
                    text: reply,
                    raw: geminiData
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        } else {
            return new Response(
                JSON.stringify({ error: 'Invalid action. Use "create" or "sendMessage"' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

    } catch (error: any) {
        console.error('Chat Proxy Error:', error);
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
