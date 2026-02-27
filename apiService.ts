// =====================================================
// 影中镜 - 后端 API 服务
// =====================================================

// 开发环境用本地地址，生产环境用环境变量或默认后端地址
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

// 存储 token
let authToken: string | null = localStorage.getItem('cinematic_token');

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '请求失败');
    }

    return data.data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('请求超时，服务器可能正在启动，请稍后重试');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// =====================================================
// 认证相关
// =====================================================

export async function sendRegisterCode(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/send-register-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function register(email: string, password: string, code?: string) {
  // 新用户注册，务必完全清空本地状态
  clearLocalArchives();
  authToken = null; // 清除内存中的 token

  // 标记为新注册用户，Interview 页面据此判断不复用旧缓存
  sessionStorage.setItem('cinematic_fresh_register', '1');

  const result = await request<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, code }),
  });
  authToken = result.token;
  localStorage.setItem('cinematic_token', result.token);

  return result;
}

export async function login(email: string, password: string) {
  // 登录前先清空本地档案（准备加载该用户的档案）
  clearLocalArchives();

  const result = await request<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  authToken = result.token;
  localStorage.setItem('cinematic_token', result.token);

  // 登录后在后台加载档案，不阻塞页面跳转
  loadUserArchives();

  return result;
}

export function logout() {
  authToken = null;
  localStorage.removeItem('cinematic_token');
  // 登出时清空本地档案
  clearLocalArchives();
}

// 清空本地档案缓存
export function clearLocalArchives() {
  // 先写空再删除，规避 iOS Capacitor WebView 的 removeItem 延迟生效问题
  const keys = ['cinematic_archives', 'cinematic_mirror_profile', 'cinematic_user_info', 'cinematic_token'];
  keys.forEach(key => {
    localStorage.setItem(key, '');
    localStorage.removeItem(key);
  });
}

// 从服务器加载用户档案到本地
export async function loadUserArchives(): Promise<void> {
  try {
    const serverProfiles = await getUserProfiles();
    if (serverProfiles && serverProfiles.length > 0) {
      // 格式化并保存到本地
      const normalized = serverProfiles.map(normalizeProfile);
      localStorage.setItem('cinematic_archives', JSON.stringify(normalized));
      // 设置最新的为当前活跃档案
      localStorage.setItem('cinematic_mirror_profile', JSON.stringify(normalized[0]));
      console.log(`[档案] 从服务器加载了 ${normalized.length} 个档案`);
    }
  } catch (error) {
    console.warn('[档案] 加载用户档案失败:', error);
  }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    timeout: 60000, // 60秒超时，邮件发送较慢
  });
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
    timeout: 60000,
  });
}

export async function getCurrentUser() {
  return request<any>('/auth/me');
}

export async function updateProfile(data: { nickname?: string; avatar_url?: string }) {
  return request<any>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function isLoggedIn(): boolean {
  return !!authToken;
}

// =====================================================
// 档案同步相关
// =====================================================

// 从服务器加载档案并与本地合并
async function syncArchivesAfterAuth(): Promise<void> {
  try {
    // 获取服务器档案
    const serverProfiles = await getUserProfiles();

    // 获取本地档案
    const localStr = localStorage.getItem('cinematic_archives');
    const localProfiles = localStr ? JSON.parse(localStr) : [];

    // 合并档案（服务器优先，按ID去重）
    const merged = mergeProfiles(serverProfiles, localProfiles);

    // 保存到本地
    localStorage.setItem('cinematic_archives', JSON.stringify(merged));

    console.log(`[档案同步] 服务器: ${serverProfiles.length}, 本地: ${localProfiles.length}, 合并后: ${merged.length}`);
  } catch (error) {
    console.warn('[档案同步] 同步失败:', error);
  }
}

// 合并档案（服务器优先）
function mergeProfiles(serverProfiles: any[], localProfiles: any[]): any[] {
  const profileMap = new Map<string, any>();

  // 先添加本地档案
  for (const p of localProfiles) {
    if (p.id) {
      // 转换本地格式到统一格式
      profileMap.set(p.id, normalizeProfile(p));
    }
  }

  // 服务器档案覆盖本地
  for (const p of serverProfiles) {
    if (p.id) {
      profileMap.set(p.id, normalizeProfile(p));
    }
  }

  // 按时间倒序
  return Array.from(profileMap.values()).sort((a, b) => {
    const timeA = a.timestamp || new Date(a.created_at).getTime();
    const timeB = b.timestamp || new Date(b.created_at).getTime();
    return timeB - timeA;
  });
}

// 统一档案格式（服务器用snake_case，前端用camelCase）
function normalizeProfile(p: any): any {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    analysis: p.analysis,
    narrative: p.narrative,
    timestamp: p.timestamp || new Date(p.created_at).getTime(),
    angles: p.angles,
    visualAdvice: p.visualAdvice || p.visual_advice || {},
    matches: p.matches || [],
    stylingVariants: p.stylingVariants || p.styling_variants || [],
  };
}

// 导出手动同步函数
export async function refreshArchivesFromServer(): Promise<any[]> {
  if (!authToken) {
    console.warn('[档案同步] 未登录，跳过同步');
    return [];
  }

  await syncArchivesAfterAuth();
  const str = localStorage.getItem('cinematic_archives');
  return str ? JSON.parse(str) : [];
}

// =====================================================
// 试镜相关
// =====================================================

let currentSessionId: string | null = null;

export async function startInterview(userName?: string, userGender?: string, language?: 'zh' | 'en') {
  const result = await request<{ sessionId: string; initialMessage: any }>('/interview/start', {
    method: 'POST',
    body: JSON.stringify({ userName, userGender, language: language || 'zh' }),
  });
  currentSessionId = result.sessionId;
  return result;
}

export async function sendInterviewMessage(message: string) {
  if (!currentSessionId) {
    throw new Error('没有活跃的试镜会话');
  }
  return request<{ response: any; isFinished: boolean; round: number }>(
    `/interview/session/${currentSessionId}/message`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );
}

export async function generateProfile() {
  if (!currentSessionId) {
    throw new Error('没有活跃的试镜会话');
  }
  const profile = await request<any>(`/interview/session/${currentSessionId}/generate`, {
    method: 'POST',
    timeout: 120000, // 120秒超时，档案生成需要较长时间
  });
  currentSessionId = null;
  return profile;
}

export async function getUserProfiles() {
  return request<any[]>('/interview/profiles');
}

export async function getProfile(profileId: string) {
  return request<any>(`/interview/profiles/${profileId}`);
}

// =====================================================
// 咨询相关
// =====================================================

let currentConsultationId: string | null = null;

export async function startConsultation(profileId: string, language?: 'zh' | 'en') {
  // 获取用户昵称
  let userName = '';
  try {
    const userInfoStr = localStorage.getItem('cinematic_user_info');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      userName = userInfo.name || '';
    }
  } catch (e) { }

  const result = await request<{ sessionId: string; welcomeMessage: any }>('/consultation/start', {
    method: 'POST',
    body: JSON.stringify({ profileId, language: language || 'zh', userName }),
  });
  currentConsultationId = result.sessionId;
  return result;
}

export async function sendConsultationMessage(message: string) {
  if (!currentConsultationId) {
    throw new Error('没有活跃的咨询会话');
  }
  return request<any>(`/consultation/session/${currentConsultationId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export function endConsultation() {
  if (currentConsultationId) {
    request(`/consultation/session/${currentConsultationId}`, { method: 'DELETE' }).catch(() => { });
    currentConsultationId = null;
  }
}

// =====================================================
// 电影广场相关
// =====================================================

export async function getPlazaPosts(page = 1, limit = 10) {
  return request<any>(`/plaza/posts?page=${page}&limit=${limit}`);
}

export async function createPost(content: string, imageUrls: string[] = [], inspirationTags: string[] = [], location?: string) {
  return request<any>('/plaza/posts', {
    method: 'POST',
    body: JSON.stringify({ content, image_urls: imageUrls, inspiration_tags: inspirationTags, location }),
  });
}

export async function likePost(postId: string) {
  return request<any>(`/plaza/posts/${postId}/like`, { method: 'POST' });
}

export async function unlikePost(postId: string) {
  return request<any>(`/plaza/posts/${postId}/like`, { method: 'DELETE' });
}

export async function getComments(postId: string) {
  return request<any[]>(`/plaza/posts/${postId}/comments`);
}

export async function addComment(postId: string, content: string) {
  return request<any>(`/plaza/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// =====================================================
// 视频聊天相关
// =====================================================

export async function sendVideoChat(message: string, imageData: string, profileId: string, language?: 'zh' | 'en'): Promise<string> {
  const result = await request<{ response: string }>('/consultation/video-chat', {
    method: 'POST',
    body: JSON.stringify({ message, imageData, profileId, language: language || 'zh' }),
  });
  return result.response;
}

// =====================================================
// 语音合成 TTS 相关
// =====================================================

// 检查 TTS 服务状态
export async function checkTtsStatus(): Promise<boolean> {
  try {
    const result = await request<{ configured: boolean }>('/tts/status');
    return result.configured;
  } catch {
    return false;
  }
}

// 合成语音并播放
export async function synthesizeAndPlaySpeech(text: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn('TTS 合成失败');
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.warn('TTS 播放失败:', error);
  }
}

// 合成语音并播放（带回调，知道播放完成）
export async function synthesizeAndPlaySpeechWithCallback(
  text: string,
  onComplete?: () => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn('TTS 合成失败');
      onComplete?.();
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      onComplete?.();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      onComplete?.();
    };

    await audio.play();
  } catch (error) {
    console.warn('TTS 播放失败:', error);
    onComplete?.();
  }
}

// =====================================================
// 积分相关
// =====================================================

export interface CreditsBalance {
  balance: number;
  totalInterviews: number;
  freeInterviewsRemaining: number;
  isMember?: boolean;
  memberExpiry?: string;
  config: {
    INITIAL_CREDITS: number;
    FREE_INTERVIEWS: number;
    INTERVIEW_COST: number;
    CONSULTATION_COST: number;
  };
  packages: { id: string; credits: number; priceCNY: number; priceUSD: number; label: string; labelEn: string }[];
  membership: {
    productId: string;
    priceCNY: number;
    priceUSD: number;
    label: string;
    labelEn: string;
    benefits: {
      monthlyInterviews: number;
      monthlyConsultations: number;
      monthlyBonusCredits: number;
    };
    benefitLabels: {
      zh: string[];
      en: string[];
    };
  };
}

export interface CreditsCheck {
  allowed: boolean;
  reason?: string;
  cost: number;
}

// 获取积分余额
export async function getCreditsBalance(): Promise<CreditsBalance> {
  return request<CreditsBalance>('/credits/balance');
}

// 检查是否可以开始试镜
export async function checkCanStartInterview(): Promise<CreditsCheck> {
  return request<CreditsCheck>('/credits/check/interview');
}

// 检查是否可以开始咨询
export async function checkCanStartConsultation(): Promise<CreditsCheck> {
  return request<CreditsCheck>('/credits/check/consultation');
}

// 获取积分变动历史
export async function getCreditsHistory(limit = 20): Promise<any[]> {
  return request<any[]>(`/credits/history?limit=${limit}`);
}

// 验证购买并充值（支持 Apple StoreKit 2 JWS 收据）
// 带重试机制：Render 冷启动可能导致首次请求超时
export async function verifyPurchase(productId: string, transactionId: string, receipt?: string): Promise<{
  creditsAdded: number;
  newBalance: number;
}> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request<{ creditsAdded: number; newBalance: number }>('/credits/verify', {
        method: 'POST',
        body: JSON.stringify({ productId, transactionId, receipt }),
        timeout: 60000, // 60秒超时，给 Render 冷启动留够时间
      });
    } catch (err: any) {
      if (attempt === maxRetries) throw err;
      // 超时或网络错误才重试，业务错误直接抛出
      if (!err.message?.includes('超时') && !err.message?.includes('Failed to fetch') && !err.message?.includes('NetworkError')) {
        throw err;
      }
      // 重试前等待 2 秒
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('验证失败，请稍后在积分页面点击"恢复购买"');
}

