
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
import { LanguageProvider, LanguageSwitcher, useLanguage } from './i18n/LanguageContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [profile, setProfile] = useState<PersonalityProfile | null>(() => {
    // 优先读取当前活跃的档案
    const saved = localStorage.getItem('cinematic_mirror_profile');
    if (saved) return JSON.parse(saved);

    // 如果没有活跃档案，自动加载最近的档案
    const archives = localStorage.getItem('cinematic_archives');
    if (archives) {
      const list = JSON.parse(archives);
      if (list.length > 0) {
        // 返回最新的档案
        const latest = list[0];
        localStorage.setItem('cinematic_mirror_profile', JSON.stringify(latest));
        return latest;
      }
    }
    return null;
  });

  const navigate = (view: View) => setCurrentView(view);

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
      navigate(View.RESULT);
    }, 3000);
  };

  const handleViewArchive = (archivedProfile: PersonalityProfile) => {
    setProfile(archivedProfile);
    navigate(View.RESULT);
  };

  const RenderView = () => {
    const { t } = useLanguage();

    switch (currentView) {
      case View.WELCOME:
        return <Welcome onStart={() => navigate(View.LOGIN)} />;
      case View.LOGIN:
        return <Login onDirectorLogin={() => navigate(View.STYLING)} onGoToRegister={() => navigate(View.REGISTER)} />;
      case View.REGISTER:
        return <Register onBack={() => navigate(View.LOGIN)} onComplete={() => navigate(View.INTERVIEW)} />;
      case View.INTERVIEW:
        return <Interview onComplete={handleInterviewComplete} />;
      case View.DEVELOPING:
        return <Developing />;
      case View.RESULT:
        return <Result profile={profile} onContinue={() => navigate(View.STYLING)} />;
      case View.DASHBOARD:
      case View.PLAZA:
      case View.STYLING:
      case View.PROFILE:
        return <DashboardContent view={currentView} navigate={navigate} profile={profile} onViewArchive={handleViewArchive} />;
      default:
        return <Welcome onStart={() => navigate(View.LOGIN)} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen desk-texture text-walnut flex flex-col">
        <RenderView />
      </div>
    </LanguageProvider>
  );
};

const DashboardContent: React.FC<{
  view: View;
  navigate: (v: View) => void;
  profile: PersonalityProfile | null;
  onViewArchive: (p: PersonalityProfile) => void;
}> = ({ view, navigate, profile, onViewArchive }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden relative">
      <header className="px-6 py-4 flex items-center justify-between border-b border-walnut/10 bg-parchment-base shrink-0 z-40">
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
            <img src={`https://picsum.photos/seed/${profile?.id || 'user'}/100/100`} alt="Avatar" className="w-full h-full object-cover grayscale sepia-[0.3] brightness-90" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto no-scrollbar">
          {view === View.STYLING && <Styling profile={profile} />}
          {view === View.DASHBOARD && <Dashboard profile={profile} />}
          {view === View.PLAZA && <Plaza />}
          {view === View.PROFILE && <ProfileView profile={profile} onNewRole={() => navigate(View.INTERVIEW)} onSelectArchive={onViewArchive} />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-parchment-light/95 backdrop-blur-xl border-t border-walnut/10 px-6 pt-4 pb-8 flex justify-around items-center z-50 shadow-[0_-15px_50px_rgba(61,43,31,0.15)]">
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
