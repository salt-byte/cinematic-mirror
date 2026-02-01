
import React, { useState, useEffect, useRef } from 'react';
import { startInterview, sendInterviewMessage, generateProfile } from '../apiService';
import { PersonalityProfile, ChatMessage } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';

interface ParsedMessage {
  type: 'scene' | 'dialogue';
  text: string;
}

interface UserInfo {
  name: string;
  gender: 'male' | 'female' | '';
}

const Interview: React.FC<{ onComplete: (profile: PersonalityProfile) => void }> = ({ onComplete }) => {
  const { t, language } = useLanguage();
  const [showIntro, setShowIntro] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', gender: '' });
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: ParsedMessage[] }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // 解析 AI 回复，分离场记和对话
  // 格式：动作描写 [SPLIT] 对话内容
  const parseModelResponse = (text: string): ParsedMessage[] => {
    const result: ParsedMessage[] = [];

    if (text.includes('[SPLIT]')) {
      const parts = text.split('[SPLIT]').map(p => p.trim()).filter(Boolean);

      // 第一部分是动作/场记
      if (parts.length >= 1) {
        let scene = parts[0]
          .replace(/^\[场记[:：]?\s*/, '')
          .replace(/^\[/, '').replace(/\]$/, '')
          .replace(/^（/, '').replace(/）$/, '')
          .trim();
        if (scene) {
          result.push({ type: 'scene', text: scene });
        }
      }

      // 第二部分是对话
      if (parts.length >= 2) {
        let dialogue = parts[1]
          .replace(/^["「""]/, '').replace(/["」""]$/, '')
          .trim();
        if (dialogue) {
          result.push({ type: 'dialogue', text: dialogue });
        }
      }
    } else {
      // 没有 [SPLIT]，整段作为对话
      result.push({ type: 'dialogue', text: text.trim() });
    }

    return result;
  };

  const initChat = async () => {
    setLoading(true);
    setError("");
    try {
      // 保存用户信息到 localStorage
      localStorage.setItem('cinematic_user_info', JSON.stringify(userInfo));

      // 启动试镜，传递用户信息和语言
      const { initialMessage } = await startInterview(userInfo.name, userInfo.gender, language);
      const parts = parseModelResponse(initialMessage.text);
      setMessages([{ role: 'model', parts }]);
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
    }
  };

  const handleStartInterview = () => {
    if (!userInfo.name.trim() || !userInfo.gender) {
      setError(t('interview.errorEmpty'));
      return;
    }
    setShowIntro(false);
    initChat();
  };

  useEffect(() => {
    // 延迟滚动，确保 DOM 已更新
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (!input.trim() || loading || isFinishing) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', parts: [{ type: 'dialogue', text: userMsg }] }]);
    setLoading(true);
    setError("");

    try {
      const { response, isFinished, round: newRound } = await sendInterviewMessage(userMsg);
      const parts = parseModelResponse(response.text);
      setMessages(prev => [...prev, { role: 'model', parts }]);
      setLoading(false);

      if (isFinished) {
        setIsFinishing(true);
        setTimeout(async () => {
          try {
            const profile = await generateProfile();
            onComplete(profile);
          } catch (err: any) {
            setError(err.message || t('common.error'));
            setIsFinishing(false);
          }
        }, 2000);
      } else {
        setRound(newRound);
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
    }
  };

  // 开场弹窗 - 输入名字和选择性别
  if (showIntro) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-parchment-base">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white shadow-2xl border border-walnut/10 p-8 max-w-sm w-full space-y-8">
            {/* 标题 */}
            <div className="text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-walnut/20">movie_filter</span>
              <h2 className="text-xl font-retro font-black text-walnut tracking-widest">{t('interview.registrationTitle')}</h2>
              <p className="text-[10px] font-serif text-walnut/50 italic">
                {t('interview.registrationSubtitle')}
              </p>
            </div>

            {/* 名字输入 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-walnut/40 tracking-[0.2em] uppercase block">
                {t('interview.yourName')}
              </label>
              <input
                type="text"
                className="w-full bg-transparent border-b-2 border-walnut/10 focus:border-vintageRed px-1 py-3 font-serif text-lg text-walnut transition-colors outline-none"
                placeholder={t('interview.namePlaceholder')}
                value={userInfo.name}
                onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
              />
            </div>

            {/* 性别选择 */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-walnut/40 tracking-[0.2em] uppercase block">
                {t('interview.gender')}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setUserInfo({ ...userInfo, gender: 'female' })}
                  className={`flex-1 py-4 border-2 transition-all ${userInfo.gender === 'female'
                    ? 'border-vintageRed bg-vintageRed/5 text-vintageRed'
                    : 'border-walnut/10 text-walnut/50 hover:border-walnut/30'
                    }`}
                >
                  <span className="material-symbols-outlined text-2xl block mb-1">female</span>
                  <span className="text-[11px] font-black tracking-widest">{t('interview.female')}</span>
                </button>
                <button
                  onClick={() => setUserInfo({ ...userInfo, gender: 'male' })}
                  className={`flex-1 py-4 border-2 transition-all ${userInfo.gender === 'male'
                    ? 'border-vintageRed bg-vintageRed/5 text-vintageRed'
                    : 'border-walnut/10 text-walnut/50 hover:border-walnut/30'
                    }`}
                >
                  <span className="material-symbols-outlined text-2xl block mb-1">male</span>
                  <span className="text-[11px] font-black tracking-widest">{t('interview.male')}</span>
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <p className="text-vintageRed text-sm text-center font-serif">{error}</p>
            )}

            {/* 开始按钮 */}
            <button
              onClick={handleStartInterview}
              className="w-full bg-walnut text-parchment-light py-4 font-black tracking-[0.2em] uppercase text-sm hover:bg-walnut/90 active:scale-[0.98] transition-all"
            >
              {t('interview.startAudition')}
            </button>

            <p className="text-[8px] text-walnut/30 text-center font-mono">
              {t('interview.castingSession')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSceneName = translations.interview.sceneNames[language][round - 1] || '对话';
  const sceneNumber = ['一', '二', '三', '四', '五', '六', '七', '八'][round - 1] || round;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-parchment-base">
      {/* 顶部导航 */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-walnut/10 bg-parchment-light shrink-0">
        <button className="text-walnut/30">
          <span className="material-symbols-outlined text-xl">calendar_view_day</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-retro font-black text-walnut tracking-widest">{t('interview.title')}</h1>
          <p className="text-[10px] text-walnut/40 tracking-[0.3em]">{t('interview.subtitle')}</p>
        </div>
        <button className="text-walnut/30">
          <span className="material-symbols-outlined text-xl">sticky_note_2</span>
        </button>
      </header>

      {/* 场次指示 */}
      <div className="py-6 text-center border-b border-walnut/5">
        <p className="text-sm text-walnut/40 tracking-[0.2em] font-serif">
          {t('interview.scene', { n: sceneNumber, name: currentSceneName })}
        </p>
      </div>

      {/* 消息区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar pb-40">
        {error && (
          <div className="text-center py-4">
            <p className="text-vintageRed text-sm">{error}</p>
            <button onClick={initChat} className="mt-2 text-xs text-walnut/50 underline">{t('common.retry')}</button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {msg.role === 'model' ? (
              <div className="space-y-4">
                <p className="text-sm font-retro font-bold text-walnut/60 tracking-widest">{t('interview.title')}</p>

                {msg.parts.map((part, j) => (
                  <div key={j}>
                    {part.type === 'scene' && (
                      <p className="text-[12px] text-walnut/40 italic leading-relaxed mb-3">
                        [{part.text}]
                      </p>
                    )}
                    {part.type === 'dialogue' && (
                      <p className="text-[15px] font-serif text-walnut leading-[2] tracking-wide">
                        "{part.text}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-end my-4">
                <div className="bg-walnut/10 px-5 py-3 max-w-[75%] rounded-sm">
                  <p className="text-[14px] font-serif text-walnut/80 tracking-wide">
                    {msg.parts[0]?.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="space-y-3">
            <p className="text-sm font-retro font-bold text-walnut/60 tracking-widest">{t('interview.title')}</p>
            <p className="text-walnut/30 text-sm italic">{t('interview.thinking')}</p>
          </div>
        )}

        {isFinishing && (
          <div className="py-10 text-center">
            <p className="text-walnut/40 text-sm font-serif tracking-widest">{t('interview.generatingProfile')}</p>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-6 pb-8 pt-4 bg-gradient-to-t from-parchment-base via-parchment-base to-transparent">
        <div className="flex items-center gap-3 bg-white shadow-xl px-5 py-4 border border-walnut/5">
          <input
            className="flex-1 bg-transparent text-[15px] font-serif placeholder:text-walnut/20 text-walnut outline-none"
            placeholder={t('interview.inputPlaceholder')}
            value={input}
            disabled={loading || isFinishing}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || isFinishing || !input.trim()}
            className="text-walnut/30 hover:text-vintageRed disabled:opacity-20 transition-colors"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
