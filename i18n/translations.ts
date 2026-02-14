// 多语言文本配置

export type Language = 'zh' | 'en';

export const translations = {
  // 通用
  common: {
    appName: { zh: '影中镜', en: 'Cinematic Mirror' },
    loading: { zh: '加载中...', en: 'Loading...' },
    error: { zh: '出错了', en: 'Error' },
    retry: { zh: '重试', en: 'Retry' },
    back: { zh: '返回', en: 'Back' },
    confirm: { zh: '确认', en: 'Confirm' },
    cancel: { zh: '取消', en: 'Cancel' },
    send: { zh: '发送', en: 'Send' },
    next: { zh: '下一步', en: 'Next' },
    studioArchives: { zh: '片场档案 1974', en: 'Studio Archives 1974' },
  },

  // 欢迎页
  welcome: {
    title: { zh: '影中镜', en: 'Cinematic Mirror' },
    subtitle: { zh: 'CINEMATIC MIRROR', en: 'CINEMATIC MIRROR' },
    tagline: { zh: '"每个人都是一部未完成的电影"', en: '"Everyone is an unfinished film"' },
    quote: { zh: '“生活本身就是一场未剪辑的杰作。”', en: '“Life itself is an unedited masterpiece.”' },
    enterStudio: { zh: '进入片场', en: 'Enter Studio' },
    enterStudioEn: { zh: 'Enter Studio', en: 'Enter Studio' },
    serialNo: { zh: 'SERIAL NO. CM-2024-ARCHIVE', en: 'SERIAL NO. CM-2024-ARCHIVE' },
  },

  // 登录/注册
  auth: {
    login: { zh: '登录', en: 'Login' },
    register: { zh: '注册', en: 'Register' },
    email: { zh: '联络电传 / EMAIL ADDR', en: 'EMAIL ADDRESS' },
    password: { zh: '私人密钥 / STUDIO PASS', en: 'STUDIO PASS' },
    loginTitle: { zh: '老戏骨回归', en: 'Welcome Back' },
    loginSubtitle: { zh: '"熟悉的面孔，新的篇章"', en: '"Familiar face, new chapter"' },
    registerTitle: { zh: '新晋导演档案录入', en: 'New Director Registration' },
    registerSubtitle: { zh: '"请签署这份协议，开启你的影史篇章"', en: '"Sign this agreement to begin your cinematic journey"' },
    signIn: { zh: '签到入场', en: 'Sign In' },
    signUp: { zh: '签约并进入试镜', en: 'Sign Up & Enter Audition' },
    noAccount: { zh: '新面孔？立即签约', en: "New here? Sign up" },
    hasAccount: { zh: '已是老戏骨？返回登录', en: 'Already registered? Log in' },
    agreement: { zh: '签署即表示您同意让AI分析您的灵魂并重构您的电影现实', en: 'By signing, you agree to let AI analyze your soul and reconstruct your cinematic reality' },
    agreementEn: { zh: 'BY SIGNING, YOU AGREE TO LET AI ANALYZE YOUR SOUL AND RECONSTRUCT YOUR CINEMATIC REALITY.', en: 'BY SIGNING, YOU AGREE TO LET AI ANALYZE YOUR SOUL AND RECONSTRUCT YOUR CINEMATIC REALITY.' },
  },

  login: {
    archivesAccess: { zh: 'Archives Access', en: 'Archives Access' },
    protagonistReturn: { zh: '主角归位', en: 'Protagonist Returns' },
    errorEmpty: { zh: '请填写邮箱和密码', en: 'Please enter email and password' },
    errorFail: { zh: '登录失败', en: 'Login failed' },
    returnToStudio: { zh: 'Return to Studio', en: 'Return to Studio' },
    loggingIn: { zh: '登录中...', en: 'Logging in...' },
    login: { zh: '直接登录', en: 'Login' },
    newChapter: { zh: 'The New Chapter', en: 'The New Chapter' },
    castingAudition: { zh: 'CASTING & AUDITION', en: 'CASTING & AUDITION' },
    findRole: { zh: '寻找你的角色', en: 'Find Your Role' },
    registerNow: { zh: '立刻注册账号', en: 'Register Now' },
    registerHint: { zh: 'New talent must register with the archives before the first interview session.', en: 'New talent must register with the archives before the first interview session.' },
    forgotPassword: { zh: '忘记密码？', en: 'Forgot password?' },
    forgotPasswordEmailRequired: { zh: '请先填写邮箱', en: 'Please enter your email first' },
    forgotPasswordSent: { zh: '验证码已发送到您的邮箱', en: 'Verification code sent to your email' },
    forgotPasswordError: { zh: '发送失败，请检查邮箱', en: 'Failed to send, please check your email' },
    resetPassword: { zh: '重置密码', en: 'Reset Password' },
    verificationCode: { zh: '验证码', en: 'Verification Code' },
    codePlaceholder: { zh: '请输入6位验证码', en: 'Enter 6-digit code' },
    newPassword: { zh: '新密码', en: 'New Password' },
    newPasswordPlaceholder: { zh: '至少6位', en: 'At least 6 characters' },
    resetSubmit: { zh: '确认重置', en: 'Reset Password' },
    resetting: { zh: '重置中...', en: 'Resetting...' },
    resetSuccess: { zh: '密码重置成功，请用新密码登录', en: 'Password reset successful. Please login with your new password.' },
    resetError: { zh: '重置失败', en: 'Reset failed' },
    backToLogin: { zh: '返回登录', en: 'Back to Login' },
    resendCode: { zh: '重新发送验证码', en: 'Resend Code' },
    resendCooldown: { zh: '{n}秒后可重新发送', en: 'Resend in {n}s' },
    logout: { zh: '退出登录', en: 'Logout' },
    logoutConfirm: { zh: '确定要退出登录吗？', en: 'Are you sure you want to logout?' },
  },

  register: {
    studioSigning: { zh: '片场签约', en: 'Studio Signing' },
    enrollmentForm: { zh: 'Studio Enrollment Form #0024', en: 'Studio Enrollment Form #0024' },
    draftContract: { zh: 'DRAFT Contract', en: 'DRAFT Contract' },
    errorEmpty: { zh: '请填写完整信息', en: 'Please fill in all fields' },
    errorPassword: { zh: '密码至少6位', en: 'Password must be at least 6 characters' },
    errorFail: { zh: '注册失败', en: 'Registration failed' },
  },

  // 试镜/面试
  interview: {
    title: { zh: '陆野', en: 'Lu Ye' },
    subtitle: { zh: '选角对话', en: 'Casting Session' },
    registrationTitle: { zh: '试镜登记', en: 'Audition Registration' },
    registrationSubtitle: { zh: '"在镜头前，你会是谁？"', en: '"Who will you be in front of the camera?"' },
    yourName: { zh: '你的名字', en: 'Your Name' },
    namePlaceholder: { zh: '怎么称呼你？', en: 'What should I call you?' },
    gender: { zh: '性别', en: 'Gender' },
    female: { zh: '女', en: 'Female' },
    male: { zh: '男', en: 'Male' },
    errorEmpty: { zh: '请填写名字并选择性别', en: 'Please enter name and gender' },
    uploadAvatar: { zh: '上传头像', en: 'Upload Avatar' },
    avatarTooLarge: { zh: '图片大小不能超过5MB', en: 'Image must be under 5MB' },
    startAudition: { zh: '开始试镜', en: 'Start Audition' },
    castingSession: { zh: 'CASTING SESSION · STUDIO ARCHIVES', en: 'CASTING SESSION · STUDIO ARCHIVES' },
    scene: { zh: '第{n}场：{name}', en: 'Scene {n}: {name}' },
    sceneNames: {
      zh: ['内在风景', '行为轨迹', '记忆碎片', '困境抉择', '信念之光', '灵魂底色', '最终定格', '谢幕'],
      en: ['Inner Landscape', 'Behavior Pattern', 'Memory Fragments', 'Dilemma Choice', 'Light of Faith', 'Soul Essence', 'Final Frame', 'Curtain Call']
    },
    sceneNumbers: {
      zh: ['一', '二', '三', '四', '五', '六', '七', '八'],
      en: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
    },
    defaultSceneName: { zh: '对话', en: 'Dialogue' },
    thinking: { zh: '正在思考...', en: 'Thinking...' },
    generatingProfile: { zh: '生成人格档案中...', en: 'Generating personality profile...' },
    inputPlaceholder: { zh: '说点什么...', en: 'Say something...' },
    confirmLeave: { zh: '退出将丢失当前对话，确定返回？', en: 'Leaving will lose the current conversation. Go back?' },
    insufficientCredits: { zh: '积分不足，请充值后再试', en: 'Insufficient credits. Please recharge and try again.' },
  },

  // 结果页
  result: {
    topSecret: { zh: 'TOP SECRET', en: 'TOP SECRET' },
    dossier: { zh: '档案', en: 'DOSSIER' },
    verified: { zh: '人格核验 / VERIFIED', en: 'VERIFIED' },
    corePortrait: { zh: '核心人格画像 / Core Portrait', en: 'Core Personality Portrait' },
    directorNotes: { zh: '导演手记：人格维度 / DIRECTOR\'S NOTES', en: 'DIRECTOR\'S NOTES: Personality Dimensions' },
    castingMatches: { zh: '灵魂共振角色 / CASTING MATCHES', en: 'SOUL RESONANCE CHARACTERS' },
    match: { zh: '匹配', en: 'MATCH' },
    proceedToStyling: { zh: '开始造型演绎 →', en: 'Proceed to Styling →' },
    proceedHint: { zh: 'Proceed to Styling', en: 'Proceed to Styling' },
  },

  // 造型页
  styling: {
    title: { zh: '穿搭图鉴', en: 'Style Guide' },
    subtitle: { zh: "Director's Styling Dossier", en: "Director's Styling Dossier" },
    matchRate: { zh: '匹配度', en: 'Match Rate' },
    firstLook: { zh: 'LOOK 1', en: 'LOOK 1' },
    look: { zh: 'LOOK', en: 'LOOK' },
    lookIndex: { zh: 'LOOK {n} / {total}', en: 'LOOK {n} / {total}' },
    palette: { zh: '色彩密码 / Palette', en: 'Color Palette' },
    materials: { zh: '质感档案 / MATERIALS', en: 'MATERIALS' },
    texture: { zh: '材质', en: 'Texture' },
    tailoring: { zh: '剪裁要义 / TAILORING', en: 'TAILORING' },
    tailoringTitle: { zh: '剪裁', en: 'Tailoring' },
    sceneScript: { zh: '场景剧本 / SCENE SCRIPT', en: 'SCENE SCRIPT' },
    characterStory: { zh: '人物故事', en: 'Character Story' },
    story: { zh: '人物故事', en: 'Character Story' },
    intScene: { zh: 'INT. {movie} - CONTINUOUS', en: 'INT. {movie} - CONTINUOUS' },
    directorComment: { zh: '导演点评', en: "Director's Note" },
    directorNoteTitle: { zh: '导演点评', en: "Director's Note" },
    directorNoteSubtitle: { zh: "Director's Note", en: "Director's Note" },
    directorNote: { zh: '导演批注 / DIRECTOR\'S NOTE', en: "DIRECTOR'S NOTE" },
    noData: { zh: '档案尚未洗印', en: 'Profile not yet developed' },
    noDataHint: { zh: '"导演还在为你构思第一套出场造型。"', en: '"The director is still crafting your first look."' },
    noArchives: { zh: '档案尚未洗印', en: 'Profile not yet developed' },
    notReady: { zh: '"导演还在为你构思第一套出场造型。"', en: '"The director is still crafting your first look."' },
    loading: { zh: '造型数据加载中', en: 'Loading styling data...' },
    department: { zh: "Director's Styling Dossier", en: "Director's Styling Dossier" },
  },

  // 咨询/Dashboard
  dashboard: {
    title: { zh: '陆野', en: 'Lu Ye' },
    consultTitle: { zh: '咨询人格', en: 'Consult Profile' },
    selectArchive: { zh: 'Select Active Archive', en: 'Select Active Archive' },
    archiveSelect: { zh: 'Select Active Archive', en: 'Select Active Archive' },
    selectMode: { zh: '"选择咨询方式"', en: '"Choose consultation mode"' },
    textChat: { zh: '剧本深谈', en: 'Script Discussion' },
    textChatTitle: { zh: '剧本深谈', en: 'Script Discussion' },
    textChatDesc: { zh: '文字咨询穿搭建议', en: 'Text-based styling advice' },
    videoChat: { zh: '现场连线', en: 'Live Connection' },
    videoChatTitle: { zh: '现场连线', en: 'Live Connection' },
    videoChatDesc: { zh: '视频对话，AI看着你给建议', en: 'Video chat with AI visual feedback' },
    consultation: { zh: '穿搭咨询', en: 'Style Consultation' },
    consultSubtitle: { zh: '穿搭咨询', en: 'Style Consultation' },
    videoConsultation: { zh: '视频咨询', en: 'Video Consultation' },
    videoMode: { zh: '视频咨询', en: 'Video Consultation' },
    noArchive: { zh: '制片库尚未建立', en: 'No archives yet' },
    noFiles: { zh: '制片库尚未建立', en: 'No archives yet' },
    noArchiveHint: { zh: '"请先完成一场试镜以入档。"', en: '"Please complete an audition first."' },
    startAudition: { zh: '"请先完成一场试镜以入档。"', en: '"Please complete an audition first."' },
    aiSpeaking: { zh: '陆野正在说话...', en: 'Lu Ye is speaking...' },
    listening: { zh: '正在聆听，请说话...', en: 'Listening, please speak...' },
    thinking: { zh: '思考中...', en: 'Thinking...' },
    observing: { zh: '正在观察...', en: 'Observing...' },
    inputPlaceholder: { zh: '说话或打字...', en: 'Speak or type...' },
    speakOrType: { zh: '说话或打字...', en: 'Speak or type...' },
    textInputPlaceholder: { zh: '询问穿搭建议...', en: 'Ask for styling advice...' },
    typeToSend: { zh: '打字发送...', en: 'Type to send...' },
    askAdvice: { zh: '询问穿搭建议...', en: 'Ask for styling advice...' },
    cameraError: { zh: '无法访问摄像头', en: 'Cannot access camera' },
    voiceError: { zh: '语音识别失败', en: 'Voice recognition failed' },
    voiceFail: { zh: '语音识别失败', en: 'Voice recognition failed' },
    characterInfo: { zh: '你身上有{name}的影子——{description}', en: 'You have a shadow of {name} - {description}' },
    welcomeText: { zh: '我看过你的档案了。{characterInfo}来，让我看看你今天的穿搭，告诉我你想去什么场合，或者有什么穿搭上的困惑？', en: 'I have reviewed your profile. {characterInfo} Come, let me see your outfit today, tell me where you want to go, or what styling confusion you have?' },
  },

  // 电影广场
  plaza: {
    developingTitle: { zh: '功能开发中', en: 'Under Development' },
    developingDesc: { zh: '"电影广场正在紧锣密鼓地筹备中，<br/>敬请期待更多精彩内容。"', en: '"The Cinema Plaza is under construction,<br/>stay tuned for more."' },
    comingSoon: { zh: 'Coming Soon · Studio Archives', en: 'Coming Soon · Studio Archives' },
    preview: { zh: '先看看效果', en: 'Preview' },
    tabs: {
      zh: ['全集动态', '热门短片', '洗印店', '手绘分镜'],
      en: ['All Activity', 'Shorts', 'Lab', 'Storyboards']
    },
  },

  // 档案
  profile: {
    activeStamp: { zh: 'ACTIVE', en: 'ACTIVE' },
    inProgress: { zh: 'In Progress', en: 'In Progress' },
    sceneScan: { zh: 'Scene Scan Ref.', en: 'Scene Scan Ref.' },
    noRecord: { zh: '暂无演出记录', en: 'No Records' },
    waitTake: { zh: 'Wait for your first take', en: 'Wait for your first take' },
    archivedProfiles: { zh: '已收录片场档案', en: 'Archived Profiles' },
    emptyShelf: { zh: '“档案架尚且空空如也...”', en: '“The shelf is empty...”' },
    recasting: { zh: 'RE-CASTING SESSION', en: 'RE-CASTING SESSION' },
    restartScript: { zh: '重启新的人生剧本', en: 'Restart New Life Script' },
  },

  // 底部导航
  nav: {
    archive: { zh: '人格档案', en: 'Profile' },
    styling: { zh: '造型演绎', en: 'Styling' },
    consult: { zh: '导演咨询', en: 'Consult' },
    plaza: { zh: '电影广场', en: 'Plaza' },
  },

  // 显影中
  developing: {
    badge: { zh: '显影中', en: 'Developing' },
    title: { zh: '正在显影您的电影人格...', en: 'Developing your cinematic persona...' },
    scanning: { zh: 'SCANNING FILM GRAINS // NEGATIVE PROCESSING', en: 'SCANNING FILM GRAINS // NEGATIVE PROCESSING' },
  },

  // 语言切换
  language: {
    zh: { zh: '中文', en: 'Chinese' },
    en: { zh: 'English', en: 'English' },
    switchTo: { zh: '切换语言', en: 'Switch Language' },
  },
};

// 获取翻译文本的辅助函数
export function t(
  key: string,
  lang: Language,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
    if (!value) return key;
  }

  let text = value[lang] || value['zh'] || key;

  // 替换参数
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
}
