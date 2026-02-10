
import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '../types';
import { ParchmentCard, Tape, Stamp } from '../components/ParchmentCard';
import { useLanguage } from '../i18n/LanguageContext';
import { logout, getCurrentUser, getCreditsBalance, CreditsBalance } from '../apiService';
import { MOVIE_DATABASE } from '../library';

// 用户信息接口
interface UserInfo {
  name?: string;
  gender?: 'male' | 'female';
  avatar?: string;
}

interface UserAccount {
  email?: string;
  nickname?: string;
  created_at?: string;
}

// 获取用户上传的头像
const getUserAvatar = (): string | null => {
  const userInfoStr = localStorage.getItem('cinematic_user_info');
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo.avatar) return userInfo.avatar;
    } catch (e) { }
  }
  return null;
};

// 获取人格档案对应的第一个匹配角色的第一张造型图片
const getProfileImage = (profile: PersonalityProfile | null): string => {
  if (!profile?.matches || profile.matches.length === 0) {
    return `https://picsum.photos/seed/${profile?.id || 'default'}/400/400`;
  }

  const topMatch = profile.matches[0];
  const dbCharacter = MOVIE_DATABASE.find(c =>
    c.name === topMatch.name ||
    c.movie === topMatch.movie
  );

  if (dbCharacter?.stylings && dbCharacter.stylings.length > 0) {
    return dbCharacter.stylings[0].image;
  }

  return `https://picsum.photos/seed/${profile.id}/400/400`;
};

const ProfileView: React.FC<{
  profile: PersonalityProfile | null,
  onNewRole: () => void,
  onSelectArchive: (p: PersonalityProfile) => void,
  onLogout?: () => void,
  onNavigateCredits?: () => void
}> = ({ profile, onNewRole, onSelectArchive, onLogout, onNavigateCredits }) => {
  const { t, language } = useLanguage();
  const [collection, setCollection] = useState<PersonalityProfile[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [credits, setCredits] = useState<CreditsBalance | null>(null);
  const userAvatar = getUserAvatar();

  useEffect(() => {
    // 读取档案库
    const saved = localStorage.getItem('cinematic_archives');
    const existing = saved ? JSON.parse(saved) : [];
    setCollection(existing);

    // 读取用户信息 (试镜时填写的)
    try {
      const userInfoStr = localStorage.getItem('cinematic_user_info');
      if (userInfoStr) {
        setUserInfo(JSON.parse(userInfoStr));
      }
    } catch (e) { }

    // 获取用户账号信息 (注册时的邮箱等)
    loadUserAccount();

    // 加载积分余额
    loadCredits();
  }, [profile]);

  const loadUserAccount = async () => {
    try {
      const user = await getCurrentUser();
      setUserAccount({
        email: user.email,
        nickname: user.nickname,
        created_at: user.created_at,
      });
    } catch (e) {
      // 未登录或获取失败
    }
  };

  const loadCredits = async () => {
    try {
      const data = await getCreditsBalance();
      setCredits(data);
    } catch (e) {
      // 获取失败不影响页面
    }
  };

  const handleLogout = () => {
    if (confirm(t('login.logoutConfirm'))) {
      logout();
      onLogout?.();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-parchment-base pb-48 no-scrollbar overflow-y-auto min-h-screen">
      {/* 顶部：当前活跃档案 */}
      <div className="px-6 pt-12 pb-10 relative">
        {/* 登出按钮 */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 z-30 flex items-center gap-1 px-3 py-1.5 bg-walnut/10 hover:bg-walnut/20 rounded-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-walnut/60">logout</span>
          <span className="text-[10px] font-bold text-walnut/60 tracking-wider uppercase">{t('login.logout')}</span>
        </button>

        <div className="absolute top-10 right-10 rotate-12 z-20">
          <Stamp text={t('profile.activeStamp')} subText={t('profile.inProgress')} className="opacity-60" />
        </div>
        <ParchmentCard rotation="rotate-[-1deg]" className="p-8 shadow-stack">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="bg-white p-2 pb-10 shadow-vintage border border-black/5 transform rotate-3">
                <img src={userAvatar || getProfileImage(profile)} alt="" className="w-32 h-32 object-cover" />
                <div className="absolute bottom-3 left-0 right-0 text-center text-[7px] font-mono text-walnut/30 uppercase tracking-widest italic">{t('profile.sceneScan')}{profile?.id?.slice(0, 4)}</div>
              </div>
              <Tape className="-top-4 -left-6 w-20 rotate-[-15deg]" />
            </div>

            {/* 昵称（主标题）+ 会员标识 */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-2xl font-retro font-black text-walnut tracking-[0.1em]">
                {userInfo?.name || userAccount?.nickname || '--'}
              </h2>
              {credits?.isMember && (
                <span className="inline-flex items-center gap-0.5 bg-vintageRed/10 text-vintageRed text-[8px] font-bold px-2 py-0.5 tracking-wider">
                  👑 PRO
                </span>
              )}
            </div>

            {/* 副标题：收录数量 */}
            <p className="text-[11px] font-serif text-walnut/40 italic tracking-widest mb-6">
              {collection.length > 0
                ? (language === 'en' ? `${collection.length} archives collected` : `已收录 ${collection.length} 部作品`)
                : t('profile.waitTake')}
            </p>

            {/* 用户信息 */}
            <div className="w-full px-4">
              <div className="border-t border-walnut/10 pt-4 space-y-3">
                {/* 邮箱 */}
                {userAccount?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-walnut/40 uppercase tracking-wider">
                      {language === 'en' ? 'Email' : '邮箱'}
                    </span>
                    <span className="text-[11px] font-mono text-walnut/60">
                      {userAccount.email}
                    </span>
                  </div>
                )}
                {/* 性别 */}
                {userInfo?.gender && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-walnut/40 uppercase tracking-wider">
                      {language === 'en' ? 'Gender' : '性别'}
                    </span>
                    <span className="text-[13px] font-serif text-walnut/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {userInfo.gender === 'male' ? 'male' : 'female'}
                      </span>
                      {userInfo.gender === 'male' ? (language === 'en' ? 'Male' : '男') : (language === 'en' ? 'Female' : '女')}
                    </span>
                  </div>
                )}
                {/* 注册时间 */}
                {userAccount?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-walnut/40 uppercase tracking-wider">
                      {language === 'en' ? 'Joined' : '加入时间'}
                    </span>
                    <span className="text-[10px] font-mono text-walnut/50">
                      {new Date(userAccount.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ParchmentCard>
      </div>

      {/* 积分余额卡片 */}
      <div className="px-8 my-6">
        <div className="bg-white/60 border border-walnut/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-vintageRed text-xl">toll</span>
              <div>
                <div className="text-[9px] font-mono text-walnut/40 uppercase tracking-wider">
                  {language === 'en' ? 'Credits Balance' : '积分余额'}
                </div>
                <div className="text-2xl font-retro font-black text-walnut">
                  {credits?.balance ?? '--'}
                </div>
              </div>
            </div>
            {onNavigateCredits && (
              <button
                onClick={onNavigateCredits}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-vintageRed text-parchment-base text-[10px] font-black tracking-wider uppercase shadow-md active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span>
                {language === 'en' ? 'Recharge' : '充值'}
              </button>
            )}
          </div>
          {credits && credits.freeInterviewsRemaining > 0 && (
            <div className="mt-3 pt-3 border-t border-walnut/10 text-[10px] text-walnut/50 font-serif">
              {language === 'en'
                ? `${credits.freeInterviewsRemaining} free interview(s) remaining`
                : `剩余 ${credits.freeInterviewsRemaining} 次免费试镜`}
            </div>
          )}
        </div>
      </div>

      {/* 标题：手帐贴条风格 */}
      <div className="px-10 my-6">
        <div className="inline-block relative">
          <div className="bg-walnut/5 px-6 py-1.5 -rotate-1 border border-walnut/10 shadow-sm">
            <h3 className="text-[12px] font-retro font-black text-walnut/60 tracking-[0.4em] uppercase">{t('profile.archivedProfiles')}</h3>
          </div>
          <Tape className="-bottom-2 -right-4 w-12 rotate-45 opacity-30" />
        </div>
      </div>

      {/* 列表：错落拼贴风格 */}
      <div className="px-8 flex flex-wrap gap-y-12 pb-20">
        {collection.map((role, i) => (
          <div key={i} className={`w-1/2 px-2`}>
            <button
              onClick={() => onSelectArchive(role)}
              className={`relative group block w-full transition-all active:scale-95 ${i % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg] mt-4'}`}
            >
              <div className="bg-white p-1.5 pb-6 shadow-vintage border border-walnut/5 group-hover:shadow-stack transition-all">
                <div className="overflow-hidden mb-3 bg-parchment-base relative">
                  <img src={getProfileImage(role)} alt="" className="w-full h-auto block grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
                <div className="px-1 text-center">
                  <p className="text-[11px] font-retro font-black text-walnut/80 tracking-widest truncate">{role.title}</p>
                  <p className="text-[7px] text-walnut/30 font-mono uppercase italic mt-0.5">{role.matches?.[0]?.name}</p>
                </div>
              </div>
              <Tape className={`absolute ${i % 2 === 0 ? '-top-3 -right-4 rotate-[30deg]' : '-top-3 -left-4 rotate-[-30deg]'} w-14 opacity-40 group-hover:opacity-60 transition-opacity`} />
            </button>
          </div>
        ))}
        {collection.length === 0 && (
          <div className="w-full py-20 text-center opacity-20 italic font-serif text-sm">
            {t('profile.emptyShelf')}
          </div>
        )}
      </div>

      {/* 底部按钮：物理标签风格 */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="relative group">
          <button
            onClick={onNewRole}
            className="w-full bg-walnut text-parchment-light py-5 shadow-[0_10px_30px_rgba(61,43,31,0.4)] flex flex-col items-center justify-center gap-1 active:translate-y-1 active:shadow-none transition-all"
            style={{ clipPath: 'polygon(1% 0%, 99% 2%, 100% 98%, 0% 100%)' }}
          >
            <span className="text-[8px] font-bold tracking-[0.5em] uppercase opacity-30">{t('profile.recasting')}</span>
            <span className="text-sm font-retro font-black tracking-[0.3em] uppercase">{t('profile.restartScript')}</span>
          </button>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/20 backdrop-blur-sm shadow-sm rotate-2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
