
import React, { useState, useEffect } from 'react';
import { View, PersonalityProfile } from './types';
import Welcome from './views/Welcome';
import Login from './views/Login';
import Register from './views/Register';
import Interview from './views/Interview';
import Developing from './views/Developing';
import Result from './views/Result';
import Dashboard from './views/Dashboard';
import Plaza from './views/Plaza';
import Styling from './views/Styling';
import ProfileView from './views/Profile';
import Credits from './views/Credits';
import { LanguageProvider, LanguageSwitcher, useLanguage } from './i18n/LanguageContext';
import { isLoggedIn } from './apiService';

const App: React.FC = () => {
  // 启动时检测：已登录用户直接进主页，跳过 Welcome 和 Login
  const [currentView, setCurrentView] = useState<View>(() => {
    return isLoggedIn() ? View.STYLING : View.WELCOME;
  });
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);

  // 从 localStorage 加载档案
  const reloadProfile = () => {
    const saved = localStorage.getItem('cinematic_mirror_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
      return;
    }
    const archives = localStorage.getItem('cinematic_archives');
    if (archives) {
      const list = JSON.parse(archives);
      if (list.length > 0) {
        const latest = list[0];
        localStorage.setItem('cinematic_mirror_profile', JSON.stringify(latest));
        setProfile(latest);
        return;
      }
    }
    setProfile(null);
  };

  // 初始化时加载
  useEffect(() => {
    reloadProfile();
  }, []);

  const navigate = (view: View) => {
    setPreviousView(currentView);
    setCurrentView(view);
  };

  // 返回上一页，fallback 到主页或欢迎页
  const goBack = () => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(null);
    } else {
      setCurrentView(isLoggedIn() ? View.STYLING : View.WELCOME);
    }
  };

  // 登录成功后调用，重新加载用户档案
  const handleLoginSuccess = () => {
    reloadProfile();
    navigate(View.STYLING);
  };

  // 登出后调用，清空所有状态
  const handleLogout = () => {
    setProfile(null);
    setPreviousView(null);
    // 清除 sessionStorage 防止残留标记
    sessionStorage.clear();
    navigate(View.WELCOME);
  };

  const handleInterviewComplete = (newProfile: PersonalityProfile) => {
    setProfile(newProfile);
    localStorage.setItem('cinematic_mirror_profile', JSON.stringify(newProfile));

    // 同时同步到档案库
    const saved = localStorage.getItem('cinematic_archives');
    const existing = saved ? JSON.parse(saved) : [];
    const newCollection = [newProfile, ...existing.filter((p: any) => p.id !== newProfile.id)];
    localStorage.setItem('cinematic_archives', JSON.stringify(newCollection));

    navigate(View.DEVELOPING);
    setTimeout(() => {
      // 直接切换到结果页，不更新 previousView（避免"返回"到 Developing）
      setCurrentView(View.RESULT);
    }, 3000);
  };

  const handleViewArchive = (archivedProfile: PersonalityProfile) => {
    setProfile(archivedProfile);
    navigate(View.RESULT);
  };

  // 已登录用户直接进入试镜，无需再登录
  const handleNewRole = () => {
    if (isLoggedIn()) {
      navigate(View.INTERVIEW);
    } else {
      navigate(View.LOGIN);
    }
  };

  const RenderView = () => {
    const { t } = useLanguage();

    switch (currentView) {
      case View.WELCOME:
        return <Welcome onStart={() => navigate(View.LOGIN)} />;
      case View.LOGIN:
        return <Login onDirectorLogin={handleLoginSuccess} onGoToRegister={() => navigate(View.REGISTER)} onBack={() => navigate(View.WELCOME)} />;
      case View.REGISTER:
        return <Register onBack={() => navigate(View.LOGIN)} onComplete={() => navigate(View.INTERVIEW)} />;
      case View.INTERVIEW:
        return <Interview onComplete={handleInterviewComplete} onBack={goBack} />;
      case View.DEVELOPING:
        return <Developing />;
      case View.RESULT:
        return <Result profile={profile} onContinue={() => navigate(View.STYLING)} onBack={goBack} />;
      case View.DASHBOARD:
      case View.PLAZA:
      case View.STYLING:
      case View.PROFILE:
      case View.CREDITS:
        return <DashboardContent view={currentView} navigate={navigate} profile={profile} onViewArchive={handleViewArchive} onNewRole={handleNewRole} onLogout={handleLogout} />;
      default:
        return <Welcome onStart={() => navigate(View.LOGIN)} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen min-h-dvh desk-texture text-walnut flex flex-col">
        <RenderView />
      </div>
    </LanguageProvider>
  );
};

// 获取用户头像
const getUserAvatar = (profileId?: string): string => {
  const userInfoStr = localStorage.getItem('cinematic_user_info');
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo.avatar) return userInfo.avatar;
    } catch (e) { }
  }
  return `https://picsum.photos/seed/${profileId || 'user'}/100/100`;
};

const DashboardContent: React.FC<{
  view: View;
  navigate: (v: View) => void;
  profile: PersonalityProfile | null;
  onViewArchive: (p: PersonalityProfile) => void;
  onNewRole?: () => void;
  onLogout?: () => void;
}> = ({ view, navigate, profile, onViewArchive, onNewRole, onLogout }) => {
  const { t } = useLanguage();
  const userAvatar = getUserAvatar(profile?.id);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden relative">
      <header className="px-6 py-4 flex items-center justify-between border-b border-walnut/10 bg-parchment-base shrink-0 z-40" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-walnut text-xl font-light">history_edu</span>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-black tracking-[0.25em] uppercase leading-none text-walnut">{t('common.appName')}</h1>
            <p className="text-[7px] font-mono tracking-widest text-walnut/40 uppercase mt-0.5">{t('common.studioArchives')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button onClick={() => navigate(View.PROFILE)} className="size-9 rounded-full border border-walnut/20 overflow-hidden shadow-vintage active:scale-95 transition-transform">
            <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)' }}>
        {view === View.STYLING && <Styling profile={profile} />}
        {view === View.DASHBOARD && <Dashboard profile={profile} />}
        {view === View.PLAZA && <Plaza />}
        {view === View.PROFILE && <ProfileView profile={profile} onNewRole={onNewRole || (() => navigate(View.INTERVIEW))} onSelectArchive={onViewArchive} onLogout={onLogout || (() => navigate(View.WELCOME))} onNavigateCredits={() => navigate(View.CREDITS)} />}
        {view === View.CREDITS && <Credits onClose={() => navigate(View.PROFILE)} language={undefined} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-parchment-light/95 backdrop-blur-xl border-t border-walnut/10 px-6 pt-3 flex justify-around items-center z-50 shadow-[0_-15px_50px_rgba(61,43,31,0.15)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
        <NavItem icon="auto_stories" label={t('nav.styling')} active={view === View.STYLING} onClick={() => navigate(View.STYLING)} />
        <NavItem icon="ink_pen" label={t('nav.consult')} active={view === View.DASHBOARD} onClick={() => navigate(View.DASHBOARD)} />
        <NavItem icon="explore" label={t('nav.plaza')} active={view === View.PLAZA} onClick={() => navigate(View.PLAZA)} />
        <NavItem icon="person_book" label={t('nav.archive')} active={view === View.PROFILE} onClick={() => navigate(View.PROFILE)} />
      </nav>
    </div>
  );
}

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${active ? 'text-vintageRed scale-105' : 'text-walnut/40'}`}>
    <span className={`material-symbols-outlined text-[24px] ${active ? 'font-black' : 'font-light'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>{icon}</span>
    <span className="text-[9px] font-black tracking-widest uppercase">{label}</span>
    {active && <div className="absolute -top-1 right-1 size-1 bg-vintageRed rounded-full shadow-md animate-pulse" />}
  </button>
);

export default App;
