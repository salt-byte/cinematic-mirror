
import React, { useState } from 'react';
import { ParchmentCard, Tape, Stamp } from '../components/ParchmentCard';
import { register } from '../apiService';
import { useLanguage } from '../i18n/LanguageContext';

interface RegisterProps {
  onBack: () => void;
  onComplete: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onComplete }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!formData.email || !formData.password) {
      setError(t('register.errorEmpty'));
      return;
    }
    if (formData.password.length < 6) {
      setError(t('register.errorPassword'));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(formData.email, formData.password);
      onComplete();
    } catch (err: any) {
      setError(err.message || t('register.errorFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col desk-texture relative overflow-hidden p-6 pb-20" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
      <header className="flex items-center gap-4 mb-10 z-10">
        <button onClick={onBack} className="text-walnut/40 hover:text-walnut transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div>
          <h2 className="text-walnut font-retro font-black text-xl tracking-widest">{t('register.studioSigning')}</h2>
          <p className="text-[8px] font-mono text-walnut/40 uppercase tracking-widest">{t('register.enrollmentForm')}</p>
        </div>
      </header>

      <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Tape className="-top-3 left-10 rotate-1 w-24 opacity-80" />
        <ParchmentCard edgeType="zigzag" className="p-8 shadow-stack bg-[#fdfaf3]">
          <div className="absolute top-4 right-4">
            <Stamp text="DRAFT" subText="Contract" className="scale-75 opacity-20 -rotate-12" />
          </div>

          <div className="space-y-8">
            <div className="text-center border-b border-walnut/10 pb-6">
              <h3 className="text-2xl font-retro font-black text-walnut">{t('auth.registerTitle')}</h3>
              <p className="text-xs font-serif italic text-walnut/60 mt-2">{t('auth.registerSubtitle')}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-walnut/40 tracking-[0.2em] uppercase block">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b-2 border-walnut/10 focus:border-vintageRed px-1 py-2 font-mono text-sm text-walnut transition-colors outline-none"
                  placeholder="director@cinema-mirror.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-walnut/40 tracking-[0.2em] uppercase block">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  className="w-full bg-transparent border-b-2 border-walnut/10 focus:border-vintageRed px-1 py-2 font-mono text-sm text-walnut transition-colors outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-8 flex flex-col items-center space-y-4">
              {error && (
                <p className="text-vintageRed text-sm font-serif">{error}</p>
              )}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-vintageRed text-parchment-light py-5 shadow-vintage active:scale-95 transition-all transform hover:-translate-y-1 disabled:opacity-50"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 5% 100%, 0 85%)' }}
              >
                <span className="text-lg font-retro font-black tracking-[0.3em]">
                  {loading ? t('common.loading') : t('auth.signUp')}
                </span>
              </button>
              <p className="text-[8px] font-mono text-walnut/30 text-center leading-relaxed">
                {t('auth.agreementEn')}
              </p>
            </div>
          </div>
        </ParchmentCard>
        <Tape className="bottom-0 right-10 -rotate-2 w-20 opacity-60" />
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onBack}
          className="text-[10px] font-black text-walnut/40 uppercase tracking-widest hover:text-vintageRed transition-colors"
        >
          {t('auth.hasAccount')}
        </button>
      </div>
    </div>
  );
};

export default Register;
