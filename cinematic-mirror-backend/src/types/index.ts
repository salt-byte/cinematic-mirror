// =====================================================
// 影中镜 Cinematic Mirror - 类型定义
// =====================================================

// 用户相关类型
export interface User {
  id: string;
  email: string;
  nickname: string; // 片场代号
  password_hash: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  created_at: string;
}

// 人格档案相关类型
export interface CharacterMatch {
  name: string;
  movie: string;
  matchRate: number;
  description: string;
  image: string;
}

export interface StyleVariant {
  title: string;
  subtitle: string;
  image: string;
  palette: { hex: string; name: string; enName: string }[];
  materials: string[];
  tailoring: string[];
  scriptSnippet: string;
  directorNote: string;
}

export interface VisualAdvice {
  camera: string;
  lighting: string;
  motion: string;
}

export interface PersonalityAngle {
  label: string;
  essence: string;
}

export interface PersonalityProfile {
  id: string;
  user_id: string;
  title: string;
  subtitle: string;
  analysis: string;
  narrative: string;
  angles: PersonalityAngle[];
  visual_advice: VisualAdvice;
  matches: CharacterMatch[];
  styling_variants: StyleVariant[];
  interview_history: ChatMessage[];
  created_at: string;
}

// 聊天消息类型
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isDirectorGuidance?: boolean;
  timestamp?: string;
}

// 试镜会话类型
export interface InterviewSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  round: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

// 电影广场帖子类型
export interface PlazaPost {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[];
  inspiration_tags: string[];
  location?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // 关联数据
  user?: UserPublic;
  is_liked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserPublic;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// 电影角色数据库类型
export interface MovieCharacter {
  id: string;
  name: string;
  movie: string;
  traits: string[];
  styling: {
    title: string;
    subtitle: string;
    palette: { hex: string; name: string; enName: string }[];
    materials: string[];
    tailoring: string[];
    scriptSnippet: string;
    directorNote: string;
    imageUrl: string;
  };
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  nickname: string;
}

// 试镜角度
export type InterviewAngle = '审美品质' | '行为风格' | '过往经历' | '面对挑战' | '人生态度';
