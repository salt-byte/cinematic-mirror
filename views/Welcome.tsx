
import React from 'react';
import { ParchmentCard, Tape } from '../components/ParchmentCard';
import { useLanguage, LanguageSwitcher } from '../i18n/LanguageContext';

interface WelcomeProps {
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
      {/* Language Switcher - Top Right */}
      <div className="absolute right-6 z-50" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <LanguageSwitcher />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-primary text-5xl font-retro font-black tracking-tight leading-none text-vintageRed drop-shadow-sm">
          {t('welcome.title')}
        </h1>
        <p className="font-mono text-walnut/60 text-xs tracking-[0.3em] uppercase">{t('welcome.subtitle')}</p>
        <div className="h-0.5 w-16 bg-vintageRed/30 mx-auto mt-4" />
      </div>

      <div className="relative w-full max-w-sm">
        <Tape className="top-0 left-4" />
        <ParchmentCard rotation="-rotate-3" className="relative z-0 opacity-80">
          <img src="https://picsum.photos/seed/cinema1/400/500" alt="Vintage Cinema" className="w-full grayscale sepia brightness-90 rounded-sm" />
        </ParchmentCard>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-10 scale-110">
          <ParchmentCard rotation="rotate-2" className="shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <p className="text-walnut font-serif font-black text-xl leading-relaxed">
                {t('welcome.quote')}
              </p>
              <button
                onClick={onStart}
                className="w-full h-20 bg-vintageRed text-white flex items-center justify-between px-8 relative overflow-hidden active:scale-95 transition-transform"
                style={{ clipPath: 'polygon(10% 0, 90% 0, 90% 15%, 100% 25%, 100% 75%, 90% 85%, 90% 100%, 10% 100%, 10% 85%, 0% 75%, 0% 25%, 10% 15%)' }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-[8px] tracking-widest opacity-80 font-mono uppercase">{t('welcome.enterStudioEn')}</span>
                  <span className="text-lg font-black tracking-widest uppercase">{t('welcome.enterStudio')}</span>
                </div>
                <span className="material-symbols-outlined text-4xl">arrow_forward</span>
              </button>
            </div>
          </ParchmentCard>
        </div>
      </div>

      <div className="pt-20 text-center text-[10px] font-mono opacity-40 tracking-[0.2em]">
        {t('welcome.serialNo')}
      </div>
    </div>
  );
};

export default Welcome;
