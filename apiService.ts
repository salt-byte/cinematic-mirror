// =====================================================
// 影中镜 - 后端 API 服务
// =====================================================

// 开发环境用绝对路径，生产环境用相对路径
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

// 存储 token
let authToken: string | null = localStorage.getItem('cinematic_token');

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || '请求失败');
  }

  return data.data;
}

// =====================================================
// 认证相关
// =====================================================

export async function register(email: string, password: string) {
  const result = await request<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  authToken = result.token;
  localStorage.setItem('cinematic_token', result.token);
  return result;
}

export async function login(email: string, password: string) {
  const result = await request<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  authToken = result.token;
  localStorage.setItem('cinematic_token', result.token);
  return result;
}

export function logout() {
  authToken = null;
  localStorage.removeItem('cinematic_token');
}

export async function getCurrentUser() {
  return request<any>('/auth/me');
}

export function isLoggedIn(): boolean {
  return !!authToken;
}

// =====================================================
// 试镜相关
// =====================================================

let currentSessionId: string | null = null;

export async function startInterview(userName?: string, userGender?: string) {
  const result = await request<{ sessionId: string; initialMessage: any }>('/interview/start', {
    method: 'POST',
    body: JSON.stringify({ userName, userGender }),
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

export async function startConsultation(profileId: string) {
  const result = await request<{ sessionId: string; welcomeMessage: any }>('/consultation/start', {
    method: 'POST',
    body: JSON.stringify({ profileId }),
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
    request(`/consultation/session/${currentConsultationId}`, { method: 'DELETE' }).catch(() => {});
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

export async function sendVideoChat(message: string, imageData: string, profileId: string): Promise<string> {
  const result = await request<{ response: string }>('/consultation/video-chat', {
    method: 'POST',
    body: JSON.stringify({ message, imageData, profileId }),
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
