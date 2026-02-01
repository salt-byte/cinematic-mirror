import dotenv from 'dotenv';

dotenv.config();

export const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
export const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';

// 对话模型
export const CHAT_MODEL = 'deepseek-ai/DeepSeek-V3';

// 视觉模型（视频通话用）
export const VISION_MODEL = 'Qwen/Qwen2.5-VL-32B-Instruct';

if (!SILICONFLOW_API_KEY) {
  console.warn('Warning: SILICONFLOW_API_KEY not set');
}

// 通用请求函数
export async function chatCompletion(
  messages: { role: string; content: string }[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<string> {
  const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
    },
    body: JSON.stringify({
      model: options.model || CHAT_MODEL,
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.max_tokens ?? 1000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SiliconFlow API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export default { chatCompletion, CHAT_MODEL, VISION_MODEL };
