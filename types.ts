
export enum View {
  WELCOME = 'welcome',
  LOGIN = 'login',
  REGISTER = 'register',
  INTERVIEW = 'interview',
  DEVELOPING = 'developing',
  RESULT = 'result',
  DASHBOARD = 'dashboard',
  STYLING = 'styling',
  PLAZA = 'plaza',
  PROFILE = 'profile'
}

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
  // Aligning with geminiService.ts, library.ts and Styling.tsx which use scriptSnippet
  scriptSnippet: string;
  directorNote: string;
}

export interface PersonalityProfile {
  id: string;
  title: string;
  subtitle: string;
  analysis: string;
  narrative: string;
  timestamp: number;
  angles: { label: string; essence: string }[];
  visualAdvice: {
    camera: string;
    lighting: string;
    motion: string;
  };
  matches: CharacterMatch[];
  stylingVariants: StyleVariant[]; // 陆野根据你生成的专属造型建议
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isDirectorGuidance?: boolean;
}

export type InterviewAngle = '审美品质' | '行为风格' | '过往经历' | '面对挑战' | '人生态度';