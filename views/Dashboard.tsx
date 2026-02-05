
import React, { useState, useEffect, useRef } from 'react';
import { PersonalityProfile, ChatMessage } from '../types';
import { startConsultation, sendConsultationMessage, sendVideoChat, synthesizeAndPlaySpeech, synthesizeAndPlaySpeechWithCallback } from '../apiService';
import { startContinuousRecognition, stopContinuousRecognition, pauseRecognition, isSpeechConfigured, disposeSpeechRecognizer } from '../services/speechService';
import { ParchmentCard } from '../components/ParchmentCard';
import { useLanguage } from '../i18n/LanguageContext';

interface ParsedMessage {
  type: 'action' | 'dialogue';
  content: string;
}

const parseModelResponse = (text: string): ParsedMessage[] => {
  const result: ParsedMessage[] = [];

  // 按 [SPLIT] 分割
  if (text.includes('[SPLIT]')) {
    const parts = text.split('[SPLIT]').map(p => p.trim()).filter(Boolean);

    // 第一部分是动作描写，第二部分是对话
    if (parts.length >= 1) {
      // 清理动作部分的括号
      let action = parts[0]
        .replace(/^\[场记[：:]\s*/, '')
        .replace(/^\[/, '').replace(/\]$/, '')
        .replace(/^（/, '').replace(/）$/, '')
        .trim();
      if (action) {
        result.push({ type: 'action', content: action });
      }
    }

    if (parts.length >= 2) {
      // 清理对话部分的引号
      let dialogue = parts[1]
        .replace(/^["「]/, '').replace(/["」]$/, '')
        .trim();
      if (dialogue) {
        result.push({ type: 'dialogue', content: dialogue });
      }
    }
  } else {
    // 没有 [SPLIT]，整段作为对话
    result.push({ type: 'dialogue', content: text.trim() });
  }

  return result;
};

const Dashboard: React.FC<{ profile: PersonalityProfile | null }> = ({ profile: latestProfile }) => {
  const { t, language } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState<PersonalityProfile | null>(null);
  const [archives, setArchives] = useState<PersonalityProfile[]>([]);
  const [mode, setMode] = useState<'pick_role' | 'select_mode' | 'text' | 'video'>('pick_role');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognizingText, setRecognizingText] = useState(""); // 实时识别中的文字
  const [isAiSpeaking, setIsAiSpeaking] = useState(false); // AI正在说话
  const pendingMessageRef = useRef<string | null>(null); // 待发送的消息

  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cinematic_archives');
    const allArchives = saved ? JSON.parse(saved) : [];
    setArchives(allArchives);
    if (allArchives.length === 0) setMode('pick_role');
  }, []);

  useEffect(() => {
    if (mode === 'video') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setError(t('dashboard.cameraError'));
        });
    }

    // 清理：离开视频模式时关闭摄像头
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [mode]);

  useEffect(() => {
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

  // 文字咨询初始化
  useEffect(() => {
    if (selectedProfile && mode === 'text' && messages.length === 0) {
      const init = async () => {
        setLoading(true);
        setError("");
        try {
          const { welcomeMessage } = await startConsultation(selectedProfile.id, language);
          setMessages([{ role: 'model', text: welcomeMessage.text }]);
          setLoading(false);
        } catch (e: any) {
          setLoading(false);
          setError(e.message || t('common.error'));
        }
      };
      init();
    }
  }, [selectedProfile, mode]);

  // 视频咨询初始化 - 自动语音对话
  useEffect(() => {
    if (selectedProfile && mode === 'video' && messages.length === 0) {
      // 根据档案生成定制开场白
      const matches = selectedProfile.matches || [];
      const firstMatch = matches[0];
      const characterInfo = firstMatch
        ? t('dashboard.characterInfo', { name: firstMatch.name, description: (firstMatch.description?.slice(0, 30) || '...') })
        : '';

      const welcomeText = t('dashboard.welcomeText', { characterInfo });

      setMessages([{
        role: 'model',
        text: welcomeText
      }]);

      // 播放欢迎语音，播放完后开始监听
      setIsAiSpeaking(true);
      synthesizeAndPlaySpeechWithCallback(welcomeText, () => {
        setIsAiSpeaking(false);
        // AI 说完后开始连续语音识别
        startVoiceRecognition();
      });
    }

    // 清理：离开视频模式时停止语音识别
    return () => {
      stopContinuousRecognition();
      disposeSpeechRecognizer();
    };
  }, [selectedProfile, mode]);

  // 开始语音识别
  const startVoiceRecognition = () => {
    if (!isSpeechConfigured()) {
      console.warn('Speech not configured');
      return;
    }

    setIsRecording(true);
    startContinuousRecognition(
      // 识别完成回调（一句话说完）
      (text) => {
        if (text.trim() && !isAiSpeaking && !loading) {
          setRecognizingText("");
          handleAutoSend(text);
        }
      },
      // 实时识别回调
      (text) => {
        setRecognizingText(text);
      }
    );
  };

  // 自动发送识别到的消息
  const handleAutoSend = async (text: string) => {
    if (!text.trim() || loading || !selectedProfile || isAiSpeaking) return;

    // 暂停语音识别
    pauseRecognition();
    setIsRecording(false);

    const userMsg = text;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setError("");

    try {
      let imageData = '';
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          imageData = canvas.toDataURL('image/jpeg', 0.7);
        }
      }

      const response = await sendVideoChat(userMsg, imageData, selectedProfile.id, language);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      setLoading(false);

      // 播放 AI 回复语音
      const dialoguePart = response.includes('[SPLIT]') ? response.split('[SPLIT]')[1]?.trim() : response;
      if (dialoguePart) {
        setIsAiSpeaking(true);
        synthesizeAndPlaySpeechWithCallback(dialoguePart, () => {
          setIsAiSpeaking(false);
          // AI 说完后恢复语音识别
          startVoiceRecognition();
        });
      } else {
        // 没有语音，直接恢复识别
        startVoiceRecognition();
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
      // 出错也恢复识别
      startVoiceRecognition();
    }
  };

  const handleRoleSelect = (p: PersonalityProfile) => {
    setSelectedProfile(p);
    setMode('select_mode');
    setMessages([]);
    setError("");
  };

  // 文字咨询发送
  const handleTextSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setError("");

    try {
      const response = await sendConsultationMessage(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
    }
  };

  // 语音输入处理
  const handleVoiceInput = async () => {
    if (loading || isRecording) return;

    setIsRecording(true);
    setError("");

    try {
      // 假设 startSpeechRecognition 是另一个未导入的函数，但这里似乎没有使用，注释掉
      // const text = await startSpeechRecognition();
      // setIsRecording(false);
      //
      // if (text.trim()) {
      //   // 直接发送识别到的文字
      //   setInput(text);
      //   // 自动发送
      //   setTimeout(() => {
      //     const fakeEvent = { currentTarget: { value: text } };
      //     handleVideoSendWithText(text);
      //   }, 100);
      // }
    } catch (e: any) {
      setIsRecording(false);
      setError(e.message || t('dashboard.voiceFail'));
    }
  };

  // 带文字参数的视频发送
  const handleVideoSendWithText = async (text: string) => {
    if (!text.trim() || loading || !selectedProfile) return;
    const userMsg = text;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setError("");

    try {
      let imageData = '';
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          imageData = canvas.toDataURL('image/jpeg', 0.7);
        }
      }

      const response = await sendVideoChat(userMsg, imageData, selectedProfile.id, language);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      setLoading(false);
      const dialoguePart = response.includes('[SPLIT]') ? response.split('[SPLIT]')[1]?.trim() : response;
      if (dialoguePart) {
        synthesizeAndPlaySpeech(dialoguePart);
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
    }
  };

  // 视频咨询发送 - 带上当前画面
  const handleVideoSend = async () => {
    if (!input.trim() || loading || !selectedProfile) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setError("");

    try {
      // 捕获当前视频帧
      let imageData = '';
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          imageData = canvas.toDataURL('image/jpeg', 0.7);
        }
      }

      const response = await sendVideoChat(userMsg, imageData, selectedProfile.id, language);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      setLoading(false);
      // 播放 AI 回复语音
      const dialoguePart = response.includes('[SPLIT]') ? response.split('[SPLIT]')[1]?.trim() : response;
      if (dialoguePart) {
        synthesizeAndPlaySpeech(dialoguePart);
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || t('common.error'));
    }
  };

  if (archives.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-parchment-base h-screen">
        <ParchmentCard className="p-8">
          <span className="material-symbols-outlined text-4xl text-walnut/10 mb-4 font-light">folder_off</span>
          <h3 className="text-sm font-retro font-black text-walnut/60 mb-2 uppercase tracking-widest">{t('dashboard.noFiles')}</h3>
          <p className="font-serif text-[10px] text-walnut/30 italic">{t('dashboard.startAudition')}</p>
        </ParchmentCard>
      </div>
    );
  }

  if (mode === 'pick_role') {
    return (
      <div className="flex-1 flex flex-col bg-parchment-base h-screen p-10 overflow-y-auto no-scrollbar">
        <header className="mb-16 text-center">
          <h2 className="text-2xl font-retro font-black text-walnut tracking-[0.3em] uppercase">{t('dashboard.consultTitle')}</h2>
          <p className="text-[8px] font-mono text-vintageRed/60 font-bold mt-3 tracking-[0.4em] uppercase">{t('dashboard.archiveSelect')}</p>
        </header>

        <div className="grid grid-cols-1 gap-12 max-w-sm mx-auto pb-40">
          {archives.map((archive, idx) => (
            <button key={idx} onClick={() => handleRoleSelect(archive)} className="group relative text-left transition-all active:scale-[0.98]">
              <div className="relative paper-texture p-4 border border-walnut/5 shadow-sm group-hover:border-walnut/20 transition-all">
                <div className="flex gap-6 items-center">
                  <div className="size-14 bg-ink overflow-hidden border border-white/5">
                    <img src={`https://picsum.photos/seed/${archive.id}/100/100`} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-retro font-black text-sm text-walnut/80 tracking-widest leading-none">{archive.title}</h4>
                    <p className="text-[9px] font-mono text-walnut/30 uppercase truncate w-32">{archive.subtitle}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'select_mode') {
    return (
      <div className="flex-1 flex flex-col bg-parchment-base h-screen relative">
        <div className="absolute top-10 left-10">
          <button onClick={() => setMode('pick_role')} className="material-symbols-outlined text-walnut/20 hover:text-walnut text-sm">arrow_back</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-20">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-retro font-black text-walnut tracking-[0.3em] uppercase">{selectedProfile?.title}</h2>
            <p className="text-[9px] font-serif text-walnut/30 italic tracking-widest">{t('dashboard.selectMode')}</p>
          </div>
          <div className="flex flex-col gap-10 w-full max-w-xs">
            <button onClick={() => setMode('text')} className="group flex items-center justify-between border-b border-walnut/10 pb-6 active:scale-[0.98] transition-all">
              <div className="text-left space-y-1">
                <h4 className="font-black text-sm text-walnut/60 tracking-widest uppercase">{t('dashboard.textChatTitle')}</h4>
                <p className="text-[9px] text-walnut/20 font-serif italic">{t('dashboard.textChatDesc')}</p>
              </div>
              <span className="material-symbols-outlined text-walnut/10 group-hover:text-vintageRed">auto_stories</span>
            </button>
            <button onClick={() => setMode('video')} className="group flex items-center justify-between border-b border-walnut/10 pb-6 active:scale-[0.98] transition-all">
              <div className="text-left space-y-1">
                <h4 className="font-black text-sm text-walnut/60 tracking-widest uppercase">{t('dashboard.videoChatTitle')}</h4>
                <p className="text-[9px] text-walnut/20 font-serif italic">{t('dashboard.videoChatDesc')}</p>
              </div>
              <span className="material-symbols-outlined text-walnut/10 group-hover:text-vintageRed">videocam</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 视频咨询模式
  if (mode === 'video') {
    return (
      <div className="flex-1 flex flex-col h-screen bg-ink relative">
        {/* 视频画面 - 小窗口 */}
        <div className="absolute top-4 right-4 w-28 h-36 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl z-20">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className="size-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* 顶部导航 */}
        <header className="px-6 py-4 flex items-center justify-between bg-ink/80 backdrop-blur shrink-0 z-10">
          <button onClick={() => setMode('select_mode')} className="text-white/40">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-retro font-black text-white/90 tracking-widest">{t('interview.title')}</h1>
            <p className="text-[9px] text-white/40 tracking-[0.2em]">{t('dashboard.videoMode')}</p>
          </div>
          <div className="w-6" />
        </header>

        {/* 消息区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar pb-32">
          {error && (
            <div className="text-center py-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {msg.role === 'model' ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-vintageRed/80 tracking-widest">{t('interview.title')}</p>
                  <div className="bg-white/10 backdrop-blur px-5 py-4 rounded-lg max-w-[90%] space-y-2">
                    {parseModelResponse(msg.text).map((part, idx) => (
                      part.type === 'action' ? (
                        <p key={idx} className="text-[11px] text-white/40 italic leading-relaxed">
                          {part.content}
                        </p>
                      ) : (
                        <p key={idx} className="text-[14px] text-white/90 leading-relaxed">
                          {part.content}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-vintageRed/80 px-5 py-4 rounded-lg max-w-[80%]">
                    <p className="text-[14px] text-white leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-vintageRed/80 tracking-widest">{t('interview.title')}</p>
              <div className="bg-white/10 backdrop-blur px-5 py-4 rounded-lg">
                <p className="text-white/50 text-sm">{t('dashboard.observing')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 - 实时语音对话 */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 pb-6 pt-3 bg-gradient-to-t from-ink via-ink to-transparent">
          {/* 状态显示 */}
          <div className="text-center mb-3 min-h-[24px]">
            {isAiSpeaking && (
              <span className="text-white/60 text-sm">🔊 {t('dashboard.aiSpeaking')}</span>
            )}
            {isRecording && !isAiSpeaking && !loading && (
              <span className="text-vintageRed text-sm animate-pulse">🎤 {t('dashboard.listening')}</span>
            )}
            {loading && (
              <span className="text-white/40 text-sm">{t('dashboard.thinking')}</span>
            )}
          </div>

          {/* 实时识别文字显示 */}
          {recognizingText && (
            <div className="bg-white/10 backdrop-blur-xl px-4 py-3 rounded-lg mb-3 border border-white/10">
              <p className="text-white/70 text-sm">{recognizingText}</p>
            </div>
          )}

          {/* 也保留手动输入，以防语音不方便 */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-3 rounded-full border border-white/10">
            <span className={`material-symbols-outlined text-sm ${isRecording ? 'text-vintageRed animate-pulse' : 'text-white/30'}`}>
              {isRecording ? 'hearing' : 'mic'}
            </span>
            <input
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
              placeholder={isRecording ? t('dashboard.speakOrType') : t('dashboard.typeToSend')}
              value={input}
              disabled={loading || isAiSpeaking}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVideoSend()}
            />
            <button
              onClick={handleVideoSend}
              disabled={loading || !input.trim() || isAiSpeaking}
              className="text-white/50 hover:text-white disabled:opacity-20 transition-colors"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 文字咨询模式
  return (
    <div className="flex-1 flex flex-col h-screen bg-parchment-base">
      {/* 顶部导航 */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-walnut/10 bg-parchment-light shrink-0">
        <button onClick={() => setMode('select_mode')} className="text-walnut/30">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-retro font-black text-walnut tracking-widest">{t('interview.title')}</h1>
          <p className="text-[10px] text-walnut/40 tracking-[0.3em]">{t('dashboard.consultSubtitle')}</p>
        </div>
        <div className="w-6" />
      </header>

      {/* 消息区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar pb-32">
        {error && (
          <div className="text-center py-4">
            <p className="text-vintageRed text-sm">{error}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {msg.role === 'model' ? (
              <div className="space-y-3">
                <p className="text-sm font-retro font-bold text-walnut/60 tracking-widest">{t('interview.title')}</p>
                <div className="space-y-2">
                  {parseModelResponse(msg.text).map((part, idx) => (
                    part.type === 'action' ? (
                      <p key={idx} className="text-[12px] text-walnut/40 italic leading-relaxed">
                        {part.content}
                      </p>
                    ) : (
                      <p key={idx} className="text-[15px] font-serif text-walnut leading-[2] tracking-wide">
                        "{part.content}"
                      </p>
                    )
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center my-6">
                <div className="bg-white shadow-lg px-8 py-5 max-w-[85%]">
                  <p className="text-[15px] font-retro text-walnut/80 tracking-wide text-center">
                    {msg.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="space-y-3">
            <p className="text-sm font-retro font-bold text-walnut/60 tracking-widest">{t('interview.title')}</p>
            <p className="text-walnut/30 text-sm italic">{t('dashboard.thinking')}</p>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="fixed bottom-24 left-0 right-0 max-w-[430px] mx-auto px-6">
        <div className="flex items-center gap-3 bg-white shadow-xl px-5 py-4 border border-walnut/5">
          <input
            className="flex-1 bg-transparent text-[15px] font-serif placeholder:text-walnut/20 text-walnut outline-none"
            placeholder={t('dashboard.askAdvice')}
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSend()}
          />
          <button
            onClick={handleTextSend}
            disabled={loading || !input.trim()}
            className="text-walnut/30 hover:text-vintageRed disabled:opacity-20 transition-colors"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
