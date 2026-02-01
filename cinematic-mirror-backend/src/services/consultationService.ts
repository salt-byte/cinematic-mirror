import { v4 as uuidv4 } from 'uuid';
import { chatCompletion, VISION_MODEL, SILICONFLOW_API_KEY, SILICONFLOW_BASE_URL } from '../config/siliconflow';
import { CONSULTATION_SYSTEM_PROMPT, getPromptsByLanguage } from '../config/constants';
import type { ChatMessage, PersonalityProfile } from '../types/index';

// 内存中存储咨询会话
const consultationSessions = new Map<string, {
  profileId: string;
  language?: 'zh' | 'en';
  messages: { role: string; content: string }[];
  chatMessages: ChatMessage[];
}>();

export class ConsultationService {
  // 开始咨询会话
  async startConsultation(profile: PersonalityProfile, language: 'zh' | 'en' = 'zh'): Promise<{
    sessionId: string;
    welcomeMessage: ChatMessage;
  }> {
    const sessionId = uuidv4();

    // 获取对应语言的提示词
    const prompts = getPromptsByLanguage(language);

    // 构建系统提示词
    const systemPrompt = prompts.consultationPrompt.replace(
      '{PROFILE}',
      JSON.stringify({
        title: profile.title,
        subtitle: profile.subtitle,
        narrative: profile.narrative,
        analysis: profile.analysis,
        matches: profile.matches,
        styling_variants: profile.styling_variants
      }, null, 2)
    );

    // 获取欢迎消息
    const welcomePrompt = language === 'en'
      ? 'Please start the consultation, greeting me first and briefly describing your impression of this profile.'
      : '请开始咨询，先打个招呼并简单介绍你对这份档案的印象。';

    const responseText = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: welcomePrompt }
      ],
      { temperature: 0.8, max_tokens: 500 }
    );

    const welcomeMessage: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date().toISOString()
    };

    // 存储会话
    consultationSessions.set(sessionId, {
      profileId: profile.id,
      language,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: welcomePrompt },
        { role: 'assistant', content: responseText }
      ],
      chatMessages: [welcomeMessage]
    });

    return { sessionId, welcomeMessage };
  }

  // 发送咨询消息
  async sendMessage(sessionId: string, userMessage: string): Promise<ChatMessage> {
    const session = consultationSessions.get(sessionId);

    if (!session) {
      throw new Error('咨询会话不存在或已过期');
    }

    // 记录用户消息
    const userMsg: ChatMessage = {
      role: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };
    session.chatMessages.push(userMsg);
    session.messages.push({ role: 'user', content: userMessage });

    // 调用 DeepSeek
    const responseText = await chatCompletion(
      session.messages,
      { temperature: 0.8, max_tokens: 500 }
    );

    // 记录模型回复
    const modelMsg: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date().toISOString()
    };
    session.chatMessages.push(modelMsg);
    session.messages.push({ role: 'assistant', content: responseText });

    return modelMsg;
  }

  // 结束咨询会话
  endConsultation(sessionId: string): void {
    consultationSessions.delete(sessionId);
  }

  // 获取会话历史
  getSessionHistory(sessionId: string): ChatMessage[] {
    const session = consultationSessions.get(sessionId);
    return session?.chatMessages || [];
  }

  // 视频聊天 - 用户发消息，AI 看着画面回复
  async videoChat(message: string, imageData: string, profile: PersonalityProfile, language: 'zh' | 'en' = 'zh'): Promise<string> {
    const prompts = getPromptsByLanguage(language);

    let systemPrompt = '';

    if (language === 'en') {
      systemPrompt = `You are Director Lu Ye, chatting with a user about styling via video call.

User Profile:
- Title: ${profile.title}
- Description: ${profile.subtitle}
- Analysis: ${profile.analysis || ''}
- Matched Characters: ${profile.matches?.map(m => `${m.name}(${m.movie})`).join(', ') || 'None'}

Your Task:
1. Observe the user's current outfit (via image)
2. Give specific styling advice based on their question and profile traits
3. Speak like a real director - direct, tasteful, slightly arrogant but sincere
4. Keep replies within 60-100 words
5. Be specific about colors, styles, materials, and coordination
6. If the image is unclear, give advice based on the question`;
    } else {
      systemPrompt = `你是陆野导演，正在通过视频连线和用户聊穿搭。

用户的人格档案：
- 标题：${profile.title}
- 描述：${profile.subtitle}
- 分析：${profile.analysis || ''}
- 匹配角色：${profile.matches?.map(m => `${m.name}(${m.movie})`).join('、') || '无'}

你的任务：
1. 观察用户当前的穿着（通过图片）
2. 根据用户的问题和人格特点，给出具体的穿搭建议
3. 说话要像真正的导演一样 - 直接、有品味、略带傲慢但真诚
4. 回复控制在60-100字，不要太长
5. 可以具体说颜色、款式、材质、搭配方式
6. 如果图片看不清，也要根据问题给出建议`;
    }

    try {
      const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: VISION_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: message },
                ...(imageData ? [{ type: 'image_url', image_url: { url: imageData } }] : [])
              ]
            }
          ],
          temperature: 0.8,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Vision API Error:', error);
        // 如果视觉模型失败，回退到文字模型
        return this.fallbackTextResponse(message, profile);
      }

      const data = await response.json() as { choices: { message: { content: string } }[] };
      return data.choices[0]?.message?.content || '让我再看看...';
    } catch (error: any) {
      console.error('Video chat error:', error);
      return this.fallbackTextResponse(message, profile);
    }
  }

  // 回退到文字回复
  private async fallbackTextResponse(message: string, profile: PersonalityProfile): Promise<string> {
    const prompt = `你是陆野导演。用户问：${message}
用户人格：${profile.title}
请给出穿搭建议（60-100字）。`;

    return chatCompletion([
      { role: 'system', content: '你是陆野导演，给穿搭建议。直接、有品味。' },
      { role: 'user', content: prompt }
    ], { temperature: 0.8, max_tokens: 200 });
  }
}

export const consultationService = new ConsultationService();
