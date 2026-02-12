
import React, { useState, useEffect, useRef } from 'react';
import { PersonalityProfile, ChatMessage } from '../types';
import { startConsultation, sendConsultationMessage, checkCanStartConsultation } from '../apiService';
import { geminiLive } from '../services/geminiLiveService';
import { ParchmentCard } from '../components/ParchmentCard';
import { useLanguage } from '../i18n/LanguageContext';
import { MOVIE_DATABASE } from '../library';
import Credits from './Credits';

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
  const [mode, setMode] = useState<'pick_role' | 'select_mode' | 'text' | 'video'>('select_mode');
  const [pendingMode, setPendingMode] = useState<'text' | 'video' | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognizingText, setRecognizingText] = useState(""); // 实时识别中的文字
  const [isAiSpeaking, setIsAiSpeaking] = useState(false); // AI正在说话
  const pendingMessageRef = useRef<string | null>(null); // 待发送的消息
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cinematic_archives');
    const allArchives = saved ? JSON.parse(saved) : [];
    setArchives(allArchives);
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
          // 检查积分
          const creditsCheck = await checkCanStartConsultation();
          if (!creditsCheck.allowed) {
            setLoading(false);
            setShowCreditsModal(true);
            return;
          }

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

  // 视频咨询初始化 - Gemini Live API
  useEffect(() => {
    if (selectedProfile && mode === 'video') {
      initLiveSession();
    }

    return () => {
      if (geminiLive.isSessionActive()) {
        cleanupLiveSession();
      }
    };
  }, [selectedProfile, mode]);

  // 初始化 Live API 会话
  const initLiveSession = async () => {
    if (!selectedProfile) return;

    // iOS 需要在用户交互时初始化 AudioContext
    geminiLive.initAudioContext();

    setLoading(true);
    setError('');

    try {
      // 获取用户昵称
      let userName = '';
      try {
        const userInfoStr = localStorage.getItem('cinematic_user_info');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          userName = userInfo.name || '';
        }
      } catch (e) { }

      // 构建系统指令 - 根据语言切换
      const matches = selectedProfile.matches || [];
      const firstMatch = matches[0];

      // 注入匹配角色的造型上下文
      let characterContext = '';
      if (firstMatch) {
        const dbChar = MOVIE_DATABASE.find(c => c.name === firstMatch.name || c.nameEn === firstMatch.name);
        if (dbChar && dbChar.stylings.length > 0) {
          const s = dbChar.stylings[0];
          const paletteStr = s.palette.map(p => language === 'en' ? `${p.enName}(${p.hex})` : `${p.name}(${p.hex})`).join(', ');
          const note = language === 'en' ? (s.directorNoteEn || s.directorNote) : s.directorNote;
          characterContext = language === 'en'
            ? `\nThe user matches ${dbChar.nameEn || dbChar.name} from "${dbChar.movieEn || dbChar.movie}" (${firstMatch.matchRate}% match).\nStyling anchor: ${s.titleEn || s.title}\nColor palette: ${paletteStr}\nDesign philosophy: ${note}`
            : `\n用户匹配角色是${dbChar.name}（${dbChar.movie}），匹配度${firstMatch.matchRate}%。\n造型锚点：${s.title}\n色系参考：${paletteStr}\n设计思路：${note}`;
        } else {
          characterContext = language === 'en'
            ? `\nThe user matches ${firstMatch.name} from "${firstMatch.movie}" (${firstMatch.matchRate}% match).`
            : `\n用户匹配角色是${firstMatch.name}（${firstMatch.movie}），匹配度${firstMatch.matchRate}%。`;
        }
      }

      const systemInstruction = language === 'en'
        ? `You are "Lu Ye", a seasoned cinema costume designer with deep knowledge of film aesthetics and wardrobe design.
You're versed in the costume language of every cinematic era — from Golden Age Hollywood to the French New Wave, from Wong Kar-wai to Wes Anderson.
${userName ? `The user's name is "${userName}". Address them by name to create a friendly atmosphere.` : ''}${characterContext}
You're having a video conversation with the user and can see their live feed.
Please give professional styling and image advice based on their appearance, clothing, and temperament.
Use the matched character's styling language as a starting point, but boldly extend to broader cinematic aesthetics.
Be warm and natural, like chatting with a friend, but maintain professionalism.
Keep responses concise, just 1-2 sentences each time, like natural human conversation.
Respond in English.`
        : `你是"陆野"，一位资深电影造型师，拥有深厚的电影美学素养和服装设计功底。
你熟悉各个时代经典电影的服装设计语言，从王家卫到韦斯·安德森，从黄金好莱坞到法国新浪潮。
${userName ? `用户的名字是"${userName}"。请用名字称呼用户，营造亲切的氛围。` : ''}${characterContext}
你正在与用户进行视频对话，可以看到他们的实时画面。
请根据用户的外表、穿着、气质给出专业的穿搭和形象建议。
以匹配角色的造型语言为起点，但大胆延伸到更广阔的电影美学。
语气要温暖自然，像朋友聊天一样，但保持专业度。
回复要简洁，每次只说1-2句话，像真人对话一样自然。
使用中文回复。`;

      // 连接 Live API
      await geminiLive.connect({
        systemInstruction,
        voiceName: 'Orus', // 有磁性的男声
        onTextResponse: (text) => {
          // 累积转录文本
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'model') {
              return [...prev.slice(0, -1), { ...last, text: last.text + text }];
            }
            return [...prev, { role: 'model', text }];
          });
          setIsAiSpeaking(true);
        },
        onAudioData: () => {
          setIsAiSpeaking(true);
        },
        onConnected: () => {
          console.log('✅ Live API connected');
          setLoading(false);
          startMediaCapture();
          // 发送初始提示让 AI 先开口
          setTimeout(() => {
            geminiLive.sendText(language === 'en'
              ? '(Session started. Greet the user warmly and ask about their outfit today.)'
              : '（会话开始。请温暖地问候用户，询问他们今天的穿搭。）'
            );
          }, 500);
        },
        onDisconnected: () => {
          setIsAiSpeaking(false);
          setIsRecording(false);
        },
        onInterrupted: () => {
          // 用户打断了 AI
          setIsAiSpeaking(false);
        },
        onError: (err) => {
          console.error('Live API error:', err);
          setError(err.message);
          setLoading(false);
        }
      });

      setMessages([]);

    } catch (err: any) {
      console.error('Failed to init live session:', err);
      setError(err.message || 'Failed to connect to Live API');
      setLoading(false);
    }
  };

  // 开始捕获音视频
  const startMediaCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 音频处理
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!geminiLive.isSessionActive()) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        geminiLive.sendAudio(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      setIsRecording(true);

      // 每秒发送一帧视频
      frameIntervalRef.current = window.setInterval(() => {
        if (!geminiLive.isSessionActive()) return;

        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, 640, 480);
            const imageData = canvas.toDataURL('image/jpeg', 0.5);
            geminiLive.sendVideoFrame(imageData);
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start media capture:', err);
      setError(t('dashboard.cameraError'));
    }
  };

  // 清理 Live API 会话
  const cleanupLiveSession = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    geminiLive.disconnect();
    setIsRecording(false);
    setIsAiSpeaking(false);
  };

  // 视频模式下发送文字
  const handleLiveTextSend = () => {
    if (!input.trim() || !geminiLive.isSessionActive()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    geminiLive.sendText(userMsg);
  };

  // 用户在 pick_role 页选完角色后，自动进入之前选的模式
  const handleRoleSelect = (p: PersonalityProfile) => {
    setSelectedProfile(p);
    setMessages([]);
    setError("");
    // 直接进入之前选好的模式
    if (pendingMode) {
      setMode(pendingMode);
    }
  };

  // 用户在 select_mode 页选好模式后，跳到选角色
  const handleModeSelect = (chosenMode: 'text' | 'video') => {
    if (archives.length === 0) {
      // 没有存档，提示先去试镜
      setError(language === 'en' ? 'Please complete an audition first to create a character profile.' : '请先完成试镜以创建角色档案。');
      return;
    }
    setPendingMode(chosenMode);
    setMode('pick_role');
  };

  // 切换咨询模式时清空消息（从会话内切换时使用）
  const handleModeChange = (newMode: 'text' | 'video') => {
    if (mode === 'video' && geminiLive.isSessionActive()) {
      cleanupLiveSession();
    }
    setMessages([]);
    setError("");
    setMode(newMode);
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

  if (mode === 'select_mode') {
    return (
      <div className="flex-1 flex flex-col bg-parchment-base h-screen relative">
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-retro font-black text-walnut tracking-[0.3em] uppercase">{t('dashboard.consultTitle')}</h2>
            <p className="text-[9px] font-serif text-walnut/30 italic tracking-widest">{t('dashboard.selectMode')}</p>
            <p className="text-[9px] font-serif text-walnut/40 mt-1">
              {language === 'en' ? '🎬 20 credits per consultation' : '🎬 每次咨询消耗 20 积分'}
            </p>
          </div>

          {error && (
            <div className="text-center">
              <p className="text-vintageRed text-sm font-serif">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-8 w-full max-w-xs">
            {/* 视频咨询 —— 主推 */}
            <button onClick={() => handleModeSelect('video')} className="group relative paper-texture p-6 border-2 border-vintageRed/20 hover:border-vintageRed/50 active:scale-[0.98] transition-all">
              <div className="absolute -top-2 right-4 bg-vintageRed text-parchment-base text-[7px] font-bold tracking-widest uppercase px-3 py-0.5">
                {language === 'en' ? 'RECOMMENDED' : '推荐'}
              </div>
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-full bg-vintageRed/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-vintageRed text-2xl">videocam</span>
                </div>
                <div className="text-left space-y-1 flex-1">
                  <h4 className="font-black text-base text-walnut tracking-widest uppercase">{t('dashboard.videoChatTitle')}</h4>
                  <p className="text-[9px] text-walnut/30 font-serif italic">{t('dashboard.videoChatDesc')}</p>
                </div>
              </div>
            </button>

            {/* 文字咨询 */}
            <button onClick={() => handleModeSelect('text')} className="group flex items-center gap-5 border-b border-walnut/10 pb-6 active:scale-[0.98] transition-all">
              <div className="size-10 rounded-full bg-walnut/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-walnut/30 group-hover:text-vintageRed text-xl">auto_stories</span>
              </div>
              <div className="text-left space-y-1 flex-1">
                <h4 className="font-black text-sm text-walnut/60 tracking-widest uppercase">{t('dashboard.textChatTitle')}</h4>
                <p className="text-[9px] text-walnut/20 font-serif italic">{t('dashboard.textChatDesc')}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'pick_role') {
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

    return (
      <div className="flex-1 flex flex-col bg-parchment-base h-screen p-10 overflow-y-auto no-scrollbar">
        <div className="mb-4">
          <button onClick={() => { setMode('select_mode'); setError(''); }} className="flex items-center gap-1 text-walnut/40 hover:text-walnut transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
            <span className="text-[11px] font-black tracking-widest uppercase">{language === 'en' ? 'Back' : '返回'}</span>
          </button>
        </div>
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

  // 视频咨询模式 - 全屏视频通话样式
  if (mode === 'video') {
    // 获取最新的一条 AI 消息用于显示
    const latestModelMessage = [...messages].reverse().find(m => m.role === 'model');

    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* 全屏视频背景 */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* 渐变遮罩 - 顶部和底部 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* 顶部导航栏 */}
        <div className="absolute top-0 left-0 right-0 px-4 flex items-center justify-between z-10" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
          <button onClick={() => { cleanupLiveSession(); setMode('select_mode'); }} className="size-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-retro font-black text-white tracking-widest drop-shadow-lg">{t('interview.title')}</h1>
            <p className="text-[9px] text-white/60">{t('dashboard.videoMode')}</p>
          </div>
          <div className="size-10 flex items-center justify-center">
            {isRecording && <div className="size-3 bg-red-500 rounded-full animate-pulse shadow-lg" />}
          </div>
        </div>

        {/* AI 回复气泡 - 显示在中下部 */}
        {latestModelMessage && (
          <div className="absolute left-4 right-4 bottom-44 z-10">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/10 shadow-2xl">
              <p className="text-[10px] font-bold text-vintageRed mb-2 tracking-widest">{t('interview.title')}</p>
              {parseModelResponse(latestModelMessage.text).map((part, idx) => (
                part.type === 'action' ? (
                  <p key={idx} className="text-[11px] text-white/50 italic mb-1">{part.content}</p>
                ) : (
                  <p key={idx} className="text-[14px] text-white leading-relaxed">{part.content}</p>
                )
              ))}
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && !latestModelMessage && (
          <div className="absolute left-4 right-4 bottom-44 z-10">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/10">
              <p className="text-white/50 text-[13px]">{t('dashboard.observing')}</p>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="absolute left-4 right-4 top-24 z-10">
            <div className="bg-red-500/80 backdrop-blur rounded-lg px-4 py-3">
              <p className="text-white text-sm text-center">{error}</p>
            </div>
          </div>
        )}

        {/* 底部控制区域 */}
        <div className="absolute bottom-0 left-0 right-0 px-4 z-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
          {/* 状态显示 */}
          <div className="text-center mb-4">
            {isAiSpeaking && (
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-[12px]">
                <span className="material-symbols-outlined text-[16px] animate-pulse">volume_up</span>
                {t('dashboard.aiSpeaking')}
              </span>
            )}
            {isRecording && !isAiSpeaking && !loading && (
              <span className="inline-flex items-center gap-2 bg-vintageRed/80 px-4 py-2 rounded-full text-white text-[12px] animate-pulse">
                <span className="material-symbols-outlined text-[16px]">mic</span>
                {t('dashboard.listening')}
              </span>
            )}
            {loading && (
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white/60 text-[12px]">
                {t('dashboard.thinking')}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            {/* 挂断按钮 */}
            <button
              onClick={() => { cleanupLiveSession(); setMode('select_mode'); }}
              className="size-14 rounded-full bg-red-600/90 backdrop-blur flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-white text-2xl">call_end</span>
            </button>

            {/* 输入框 */}
            <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 h-14">
              <input
                className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/40 outline-none"
                placeholder={isRecording ? t('dashboard.speakOrType') : t('dashboard.typeToSend')}
                value={input}
                disabled={loading || isAiSpeaking}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLiveTextSend()}
              />
              <button
                onClick={handleLiveTextSend}
                disabled={loading || !input.trim() || isAiSpeaking}
                className="size-10 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-white">send</span>
              </button>
            </div>

            {/* 剧本/记录按钮 */}
            <button
              onClick={() => setShowTranscript(true)}
              className="size-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-white">description</span>
            </button>
          </div>
        </div>

        {/* 剧本/记录弹窗 */}
        {showTranscript && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
              <h3 className="text-white font-retro font-bold tracking-widest uppercase">{t('dashboard.textChatTitle')}</h3>
              <button onClick={() => setShowTranscript(false)} className="size-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80 border border-white/10'}`}>
                    {msg.role === 'model' ? (
                      <div className="space-y-1">
                        {parseModelResponse(msg.text).map((part, idx) => (
                          part.type === 'action' ? (
                            <p key={idx} className="text-[11px] text-white/40 italic">{part.content}</p>
                          ) : (
                            <p key={idx} className="text-[14px] leading-relaxed">{part.content}</p>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px]">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* 输入区域 - 移动端适配 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 bg-gradient-to-t from-parchment-base via-parchment-base to-transparent z-50"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)' }}>
        <div className="flex items-center gap-3 bg-white shadow-xl px-4 py-3 border border-walnut/5 rounded-lg">
          <input
            className="flex-1 bg-transparent text-[15px] font-serif placeholder:text-walnut/20 text-walnut outline-none min-w-0"
            placeholder={t('dashboard.askAdvice')}
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSend()}
          />
          <button
            onClick={handleTextSend}
            disabled={loading || !input.trim()}
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
            setMode('pick_role');
          }}
          language={language}
        />
      )}
    </div>
  );
};

export default Dashboard;
