import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import { chatCompletion, CHAT_MODEL } from '../config/siliconflow';
import { DIRECTOR_SYSTEM_PROMPT, PROFILE_GENERATION_PROMPT, MOVIE_DATABASE, getDatabase, getPromptsByLanguage } from '../config/constants';
import type { ChatMessage, PersonalityProfile, CharacterMatch, StyleVariant } from '../types/index';

// 内存中存储活跃的聊天会话
const activeSessions = new Map<string, {
  userId: string;
  userName?: string;
  userGender?: string;
  messages: { role: string; content: string }[];
  chatMessages: ChatMessage[];
  round: number;
}>();

export class InterviewService {
  // 开始新的试镜会话
  async startInterview(
    userId: string,
    userName?: string,
    userGender?: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<{ sessionId: string; initialMessage: ChatMessage }> {
    const sessionId = uuidv4();

    // 根据语言选择提示词
    const prompts = getPromptsByLanguage(language);
    let systemPrompt = prompts.directorPrompt;

    // 根据用户信息调整系统提示词
    if (userName || userGender) {
      if (language === 'en') {
        const genderText = userGender === 'female' ? 'female' : userGender === 'male' ? 'male' : '';
        const userInfoText = `\n\n## Subject Information\n- Name: ${userName || 'Unknown'}\n- Gender: ${genderText || 'Unknown'}\n\nPlease provide suitable styling advice based on their gender. You may address them by their name.`;
        systemPrompt += userInfoText;
      } else {
        const genderText = userGender === 'female' ? '女性' : userGender === 'male' ? '男性' : '';
        const userInfoText = `\n\n## 受试者信息\n- 名字：${userName || '未知'}\n- 性别：${genderText || '未知'}\n\n请根据对方的性别给出合适的穿搭建议方向。称呼对方时可以使用ta的名字。`;
        systemPrompt += userInfoText;
      }
    }

    // 初始化消息历史
    const systemMessage = { role: 'system', content: systemPrompt };
    const startText = language === 'en' ? 'The audition begins, please start.' : '试镜开始，请你先开场。';
    const userStartMessage = { role: 'user', content: startText };

    // 调用 DeepSeek
    const responseText = await chatCompletion(
      [systemMessage, userStartMessage],
      { temperature: 0.85, max_tokens: 500 }
    );

    const initialMessage: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date().toISOString()
    };

    // 存储会话
    activeSessions.set(sessionId, {
      userId,
      userName,
      userGender,
      messages: [
        systemMessage,
        userStartMessage,
        { role: 'assistant', content: responseText }
      ],
      chatMessages: [initialMessage],
      round: 1
    });

    // 保存到数据库
    await supabase.from('interview_sessions').insert({
      id: sessionId,
      user_id: userId,
      messages: [initialMessage],
      round: 1,
      status: 'active'
    });

    return { sessionId, initialMessage };
  }

  // 发送消息并获取回复
  async sendMessage(sessionId: string, userMessage: string): Promise<{
    response: ChatMessage;
    isFinished: boolean;
    round: number;
  }> {
    const session = activeSessions.get(sessionId);

    if (!session) {
      throw new Error('会话不存在或已过期');
    }

    // 记录用户消息
    const userMsg: ChatMessage = {
      role: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };
    session.chatMessages.push(userMsg);
    session.messages.push({ role: 'user', content: userMessage });
    session.round++;

    // 调用 DeepSeek
    const responseText = await chatCompletion(
      session.messages,
      { temperature: 0.85, max_tokens: 500 }
    );

    // 记录模型回复
    const modelMsg: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date().toISOString()
    };
    session.chatMessages.push(modelMsg);
    session.messages.push({ role: 'assistant', content: responseText });

    // 检查是否结束
    const isFinished = this.checkIfFinished(responseText, session.round);

    // 更新数据库
    await supabase
      .from('interview_sessions')
      .update({
        messages: session.chatMessages,
        round: session.round,
        status: isFinished ? 'completed' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return {
      response: modelMsg,
      isFinished,
      round: session.round
    };
  }

  // 检查试镜是否结束
  private checkIfFinished(response: string, round: number): boolean {
    const endKeywords = ['cut', 'Cut', 'CUT', '辛苦了', '今天就到这里', '试镜结束'];
    const hasEndKeyword = endKeywords.some(keyword => response.includes(keyword));
    // 至少 8 轮才能结束，最多 12 轮自动结束
    return (hasEndKeyword && round >= 8) || round >= 12;
  }

  // 生成人格档案
  async generateProfile(sessionId: string): Promise<PersonalityProfile> {
    const session = activeSessions.get(sessionId);

    if (!session) {
      // 尝试从数据库恢复
      const { data: dbSession, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !dbSession) {
        throw new Error('会话不存在');
      }

      return this.generateProfileFromMessages(dbSession.user_id, dbSession.messages, sessionId, undefined);
    }

    return this.generateProfileFromMessages(session.userId, session.chatMessages, sessionId, session.userGender);
  }

  // 从消息历史生成档案
  private async generateProfileFromMessages(
    userId: string,
    messages: ChatMessage[],
    sessionId: string,
    userGender?: string
  ): Promise<PersonalityProfile> {
    // 构建对话历史文本
    const conversationText = messages
      .map(m => `${m.role === 'user' ? '受试者' : '陆野导演'}: ${m.text}`)
      .join('\n\n');

    // 根据性别选择角色数据库
    const characterDatabase = userGender ? getDatabase(userGender) : MOVIE_DATABASE;

    // 精简版数据库，只包含匹配所需的信息（不含造型详情）
    const simplifiedDatabase = characterDatabase.map(c => ({
      id: c.id,
      name: c.name,
      movie: c.movie,
      traits: c.traits
    }));

    // 构建提示词
    const prompt = PROFILE_GENERATION_PROMPT
      .replace('{MOVIE_DATABASE}', JSON.stringify(simplifiedDatabase, null, 2))
      + '\n\n## 试镜对话记录\n' + conversationText;

    // 调用 DeepSeek 生成档案
    const responseText = await chatCompletion(
      [
        { role: 'system', content: '你是一个专业的人格分析师。请严格按照JSON格式输出，不要添加任何其他内容。' },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.7, max_tokens: 2000 }
    );

    // 解析 JSON
    let profileData;
    try {
      // 尝试提取 JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        profileData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      console.error('Failed to parse profile JSON:', responseText);
      throw new Error('生成档案格式错误，请重试');
    }

    // 构建完整的人格档案
    const profileId = uuidv4();

    // 处理角色匹配
    const matches: CharacterMatch[] = (profileData.matches || []).map((match: any) => {
      const character = characterDatabase.find(c =>
        c.id === match.characterId || c.name === match.name
      );
      if (character) {
        return {
          name: character.name,
          movie: character.movie,
          matchRate: match.matchRate || 85,
          description: match.description || '',
          image: character.stylings[0]?.image || ''
        };
      }
      return {
        name: match.name || '未知角色',
        movie: match.movie || '未知电影',
        matchRate: match.matchRate || 80,
        description: match.description || '',
        image: `https://picsum.photos/seed/${match.name}/800/1000`
      };
    }).filter(Boolean);

    // 处理造型方案
    const stylingVariants: StyleVariant[] = [];

    // 添加匹配角色的造型（取第一套造型）
    for (const match of matches) {
      const character = characterDatabase.find((c: any) => c.name === match.name);
      if (character && character.stylings && character.stylings.length > 0) {
        const firstStyling = character.stylings[0];
        stylingVariants.push({
          title: firstStyling.title,
          subtitle: firstStyling.subtitle,
          image: firstStyling.image || '',
          palette: firstStyling.palette,
          materials: firstStyling.materials,
          tailoring: firstStyling.tailoring,
          scriptSnippet: firstStyling.scriptSnippet,
          directorNote: firstStyling.directorNote
        });
      }
    }

    // 添加 AI 生成的自定义造型
    if (profileData.stylingVariants || profileData.customStyles) {
      const customStyles = profileData.stylingVariants || profileData.customStyles || [];
      for (const style of customStyles) {
        if (style.title) {
          stylingVariants.push({
            title: style.title,
            subtitle: style.subtitle || '',
            image: style.image || `https://picsum.photos/seed/${style.title}/800/1000`,
            palette: style.palette || [],
            materials: style.materials || [],
            tailoring: style.tailoring || [],
            scriptSnippet: style.scriptSnippet || '',
            directorNote: style.directorNote || ''
          });
        }
      }
    }

    const profile: PersonalityProfile = {
      id: profileId,
      user_id: userId,
      title: profileData.title || '神秘访客',
      subtitle: profileData.subtitle || '等待解读',
      analysis: profileData.analysis || '',
      narrative: profileData.narrative || '',
      angles: profileData.angles || [],
      visual_advice: profileData.visualAdvice || { camera: '', lighting: '', motion: '' },
      matches,
      styling_variants: stylingVariants,
      interview_history: messages,
      created_at: new Date().toISOString()
    };

    // 保存到数据库
    await supabase.from('personality_profiles').insert({
      id: profile.id,
      user_id: profile.user_id,
      title: profile.title,
      subtitle: profile.subtitle,
      analysis: profile.analysis,
      narrative: profile.narrative,
      angles: profile.angles,
      visual_advice: profile.visual_advice,
      matches: profile.matches,
      styling_variants: profile.styling_variants,
      interview_history: profile.interview_history
    });

    // 更新会话状态
    await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        profile_id: profile.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // 清理内存中的会话
    activeSessions.delete(sessionId);

    return profile;
  }

  // 获取用户的所有档案
  async getUserProfiles(userId: string): Promise<PersonalityProfile[]> {
    const { data, error } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('获取档案失败: ' + error.message);
    }

    return data || [];
  }

  // 获取单个档案
  async getProfile(profileId: string): Promise<PersonalityProfile | null> {
    const { data, error } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}

export const interviewService = new InterviewService();
