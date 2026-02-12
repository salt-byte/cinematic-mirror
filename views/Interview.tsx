
import React, { useState, useEffect, useRef } from 'react';
import { startInterview, sendInterviewMessage, generateProfile, checkCanStartInterview } from '../apiService';
import { PersonalityProfile, ChatMessage } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';
import Credits from './Credits';

interface ParsedMessage {
  type: 'scene' | 'dialogue';
  text: string;
}

interface UserInfo {
  name: string;
  gender: 'male' | 'female' | '';
  avatar: string; // base64 头像
}

const Interview: React.FC<{ onComplete: (profile: PersonalityProfile) => void; onBack?: () => void }> = ({ onComplete, onBack }) => {
  const { t, language } = useLanguage();

  // 同步初始化：检查 localStorage 中是否已有用户信息，避免表单闪烁
  // 新注册用户必须重新填写，不复用旧缓存
  const [savedInfo] = useState<UserInfo | null>(() => {
    // 新注册用户：强制清空残留缓存，显示空白表单
    if (sessionStorage.getItem('cinematic_fresh_register')) {
      sessionStorage.removeItem('cinematic_fresh_register');
      localStorage.removeItem('cinematic_user_info');
      return null;
    }
    try {
      const saved = localStorage.getItem('cinematic_user_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.gender) return parsed;
      }
    } catch (e) { }
    return null;
  });

  const [showIntro, setShowIntro] = useState(!savedInfo);
  const [userInfo, setUserInfo] = useState<UserInfo>(savedInfo || { name: '', gender: '', avatar: '' });
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: ParsedMessage[] }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");
  const [autoStartInfo, setAutoStartInfo] = useState<UserInfo | null>(savedInfo);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制文件大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError(t('interview.avatarTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 压缩图片到 300x300
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 居中裁剪
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setUserInfo(prev => ({ ...prev, avatar: compressed }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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

  // 自动启动试镜（用于已有用户信息的情况）
  useEffect(() => {
    if (autoStartInfo && messages.length === 0 && !loading) {
      startInterviewWithInfo(autoStartInfo);
    }
  }, [autoStartInfo]);

  // 启动试镜的通用函数
  const startInterviewWithInfo = async (info: UserInfo) => {
    setLoading(true);
    setError("");
    setCreditsError(null);

    try {
      // 检查积分
      const creditsCheck = await checkCanStartInterview();
      if (!creditsCheck.allowed) {
        setLoading(false);
        setCreditsError(creditsCheck.reason || t('interview.insufficientCredits'));
        setShowCreditsModal(true);
        return;
      }

      const { initialMessage } = await startInterview(info.name, info.gender, language);
      const parts = parseModelResponse(initialMessage.text);
      setMessages([{ role: 'model', parts }]);
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
    }
  };

  const initChat = async () => {
    // 保存用户信息到 localStorage
    localStorage.setItem('cinematic_user_info', JSON.stringify(userInfo));
    // 启动试镜
    await startInterviewWithInfo(userInfo);
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
      <div className="flex-1 flex flex-col min-h-[100dvh] overflow-auto bg-parchment-base" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* 返回按钮 */}
        {onBack && (
          <div className="px-6 pt-4 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
            <button onClick={onBack} className="flex items-center gap-1 text-walnut/40 hover:text-walnut transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
              <span className="text-[11px] font-black tracking-widest uppercase">{t('common.back') || '返回'}</span>
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white shadow-2xl border border-walnut/10 p-8 max-w-sm w-full space-y-8">
            {/* 头像上传 */}
            <div className="flex flex-col items-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <div className={`size-24 rounded-full border-2 border-dashed overflow-hidden transition-all ${userInfo.avatar ? 'border-vintageRed' : 'border-walnut/20 hover:border-walnut/40'}`}>
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-walnut/5 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-walnut/20">add_a_photo</span>
                    </div>
                  )}
                </div>
                {userInfo.avatar && (
                  <div className="absolute -bottom-1 -right-1 size-7 bg-vintageRed rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-sm">edit</span>
                  </div>
                )}
              </button>
              <p className="text-[9px] text-walnut/40 font-mono uppercase tracking-wider">
                {t('interview.uploadAvatar')}
              </p>
            </div>

            {/* 标题 */}
            <div className="text-center space-y-2">
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
            <p className="text-[9px] text-walnut/40 text-center font-serif">
              {language === 'en'
                ? '🎬 First 3 auditions free · Then 30 credits each'
                : '🎬 前 3 次试镜免费 · 之后 30 积分/次'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSceneName = translations.interview.sceneNames[language][round - 1] || t('interview.defaultSceneName');
  const sceneNumber = translations.interview.sceneNumbers[language][round - 1] || round;

  return (
    <div className="flex-1 flex flex-col min-h-[100dvh] overflow-hidden bg-parchment-base">
      {/* 顶部导航 */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-walnut/10 bg-parchment-light shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button onClick={() => { if (onBack && confirm(t('interview.confirmLeave') || '退出将丢失当前对话，确定返回？')) onBack(); }} className="text-walnut/40 hover:text-walnut transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-retro font-black text-walnut tracking-widest">{t('interview.title')}</h1>
          <p className="text-[10px] text-walnut/40 tracking-[0.3em]">{t('interview.subtitle')}</p>
        </div>
        <div className="w-6" />
      </header>

      {/* 场次指示 */}
      <div className="py-6 text-center border-b border-walnut/5">
        <p className="text-sm text-walnut/40 tracking-[0.2em] font-serif">
          {t('interview.scene', { n: sceneNumber, name: currentSceneName })}
        </p>
      </div>

      {/* 消息区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
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

      {/* 输入区域 - 移动端适配 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 bg-gradient-to-t from-parchment-base via-parchment-base to-transparent z-50"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <div className="flex items-center gap-3 bg-white shadow-xl px-4 py-3 border border-walnut/5 rounded-lg">
          <input
            className="flex-1 bg-transparent text-[15px] font-serif placeholder:text-walnut/20 text-walnut outline-none min-w-0"
            placeholder={t('interview.inputPlaceholder')}
            value={input}
            disabled={loading || isFinishing}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || isFinishing || !input.trim()}
            className="text-walnut/30 hover:text-vintageRed disabled:opacity-20 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>

      {/* 积分充值弹窗 */}
      {showCreditsModal && (
        <Credits
          onClose={() => {
            setShowCreditsModal(false);
            // 返回上一页
            if (onBack) onBack();
          }}
          language={language}
        />
      )}
    </div>
  );
};

export default Interview;
