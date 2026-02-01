
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { PersonalityProfile } from "./types";
import { MOVIE_DATABASE } from "./library";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const UNIFIED_MODEL = "gemini-3-flash-preview";

const DIRECTOR_SYSTEM_INSTRUCTION = `
你叫陆野。二十出头的先锋导演。
【性格特征】：敏锐、直接、带有某种审美的傲慢。你不是客服，你是在寻找电影灵魂的艺术家。
【沟通规则】：
1. 说话要像个真实的人类导演。言之有物，带有电影感的修辞，但不要废话。字数控制在 40-80 字。
2. 绝对禁止在回复内容中包含 "[场记]"、"[对话]"、"[视听]" 这样的文字标签。
3. 必须使用 [SPLIT] 符号分割你的回复为两个部分：
   - 第一部分：你的动作或神态描写。
   - 第二部分：对话内容（你对用户的评价或提问）。
4. 绝对不要写环境音或氛围描写，只写你的动作和对话。
【试镜逻辑】：
你要通过谈话挖掘用户在审美、行为、经历、挑战、态度这五个维度的特质。8-12 轮内收尾。
`;

const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if ((error?.status === 429 || error?.message?.includes("429")) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const startDirectorChat = (): Chat => {
  return getAI().chats.create({
    model: UNIFIED_MODEL,
    config: {
      systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION,
      temperature: 0.85,
    },
  });
};

export const sendMessageWithRetry = async (chat: any, message: string) => {
  return await callWithRetry(() => chat.sendMessage({ message }));
};

export const parseFinalSummary = async (chat: any): Promise<PersonalityProfile> => {
  const history = await chat.getHistory();
  const dbContext = MOVIE_DATABASE.map(c => 
    `电影参考: ${c.name} (作品:《${c.movie}》) - 风格核心: ${c.traits.join('/')}. 造型建议参考: ${c.styling.title}, 材质: ${c.styling.materials.join(',')}`
  ).join('\n');
  
  const synthesisPrompt = `
试镜结束。陆野，请基于对话历史完成这份人格档案。
要求：
1. 深度分析用户的人格底片。
2. 【核心】必须从以下电影角色库中挑选 2 个灵魂最契合的角色作为匹配：
${dbContext}
3. 造型方案（stylingVariants）必须基于这 2 个匹配的角色进行创作，不能凭空捏造。方案应包含角色的特质，但要说明如何为用户进行“性格化微调”。

输出严格的 JSON。
`;

  const fn = async () => {
    const ai = getAI();
    return await ai.models.generateContent({
      model: UNIFIED_MODEL,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: synthesisPrompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            analysis: { type: Type.STRING },
            narrative: { type: Type.STRING },
            angles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { label: { type: Type.STRING }, essence: { type: Type.STRING } }
              }
            },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  movie: { type: Type.STRING },
                  matchRate: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                }
              }
            },
            stylingVariants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  palette: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, enName: { type: Type.STRING } }
                    }
                  },
                  materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tailoring: { type: Type.ARRAY, items: { type: Type.STRING } },
                  scriptSnippet: { type: Type.STRING },
                  directorNote: { type: Type.STRING }
                }
              }
            }
          },
          required: ["id", "title", "subtitle", "analysis", "narrative", "angles", "matches", "stylingVariants"]
        }
      }
    });
  };

  const response = await callWithRetry(fn);
  return JSON.parse(response.text);
};

export const startConsultationChat = (profile: PersonalityProfile): Chat => {
  return getAI().chats.create({
    model: UNIFIED_MODEL,
    config: {
      systemInstruction: `你叫陆野。基于档案：${profile.title}。简洁但深入地回答穿搭咨询。使用 [SPLIT] 分割你的动作描写与对话内容。绝对不要写环境音，只写动作和对话。`,
      temperature: 0.8,
    },
  });
};
