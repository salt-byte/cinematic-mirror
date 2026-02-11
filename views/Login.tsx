
import React, { useState } from 'react';
import { login, forgotPassword } from '../apiService';
import { useLanguage } from '../i18n/LanguageContext';

interface LoginProps {
  onDirectorLogin: () => void;
  onGoToRegister: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onDirectorLogin, onGoToRegister, onBack }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('login.errorEmpty'));
      return;
    }
    setLoading(true);
    setError("");
    setForgotSuccess(false);
    try {
      await login(email, password);
      onDirectorLogin();
    } catch (err: any) {
      setError(err.message || t('login.errorFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('login.forgotPasswordEmailRequired'));
      return;
    }
    setForgotLoading(true);
    setError("");
    setForgotSuccess(false);
    try {
      await forgotPassword(email);
      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.message || t('login.forgotPasswordError'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col paper-texture bg-parchment-base relative overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* 顶部海报区域 - 延伸到状态栏 */}
      <div className="relative w-full shrink-0" style={{ height: 'calc(env(safe-area-inset-top, 0px) + 224px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div
          className="absolute inset-0 bg-center bg-cover grayscale sepia-[0.3] brightness-75"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQTp2Xnb9Mq1T1VHa-SDuOoAaWLhEFnqwApjOL-fJi3k83SxgGvancGV-hkaGhXn3OjPMHE-4tszvZyQvlTEFBA7QmLa9zbI0JOrtP-LQyiT4FMZxXWjQW_RKdY22Z0Nh1f1-YFTxbeRdWUWcXdlrFz2mfS6XIneAAgtkChbAmjyWWpeVh_FKfY7jizCt_1vsqOfo8cvB6p-tk4Zu3kzW7Pb7FN8htiO1Bh9X_n2YLDa60WqEYe1aSJXjsUOTBLJgmA_Ay8SsSs1I')" }}
        ></div>
        {/* 返回按钮 */}
        <button onClick={onBack} className="absolute top-4 left-4 z-20 size-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center active:scale-95 transition-transform" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}>
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-parchment-base via-transparent to-black/60"></div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-vintageRed text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-[0.3em] uppercase shadow-lg">{t('login.archivesAccess')}</span>
          </div>
          <h1 className="text-walnut text-4xl font-black italic tracking-tighter leading-none font-retro">{t('common.appName')}</h1>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 px-8 pt-8 z-10 flex flex-col">
        {/* 登录区域 */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-walnut text-xl font-black tracking-widest uppercase">{t('login.protagonistReturn')}</h2>
            <div className="flex-1 h-px bg-walnut/10" />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-walnut/40 text-[9px] font-black tracking-[0.2em] flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-[14px]">alternate_email</span>
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/30 border-b-2 border-walnut/10 focus:border-vintageRed px-0 text-walnut font-mono transition-all outline-none"
                placeholder="director@studio.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-walnut/40 text-[9px] font-black tracking-[0.2em] flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-[14px]">key</span>
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/30 border-b-2 border-walnut/10 focus:border-vintageRed px-0 text-walnut font-mono transition-all outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="text-vintageRed/70 text-[11px] font-medium hover:text-vintageRed transition-colors underline"
              >
                {forgotLoading ? '...' : t('login.forgotPassword')}
              </button>
            </div>

            {forgotSuccess && (
              <p className="text-green-600 text-sm font-serif text-center">{t('login.forgotPasswordSent')}</p>
            )}
            {error && (
              <p className="text-vintageRed text-sm font-serif text-center">{error}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-4 bg-walnut text-parchment-light py-5 shadow-stack flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group disabled:opacity-50"
            >
              <span className="text-[8px] font-bold tracking-[0.4em] uppercase opacity-40 group-hover:opacity-60 transition-opacity">{t('login.returnToStudio')}</span>
              <span className="text-xl font-black tracking-[0.2em]">{loading ? t('login.loggingIn') : t('login.login')}</span>
            </button>
          </div>
        </div>

        {/* 合并后的注册 CTA：寻找你的角色 */}
        <div className="mt-auto mb-12 flex flex-col items-center">
          <div className="w-full flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-walnut/10" />
            <span className="text-[9px] font-black text-walnut/20 tracking-[0.5em] uppercase italic">{t('login.newChapter')}</span>
            <div className="flex-1 h-px bg-walnut/10" />
          </div>

          <button
            onClick={onGoToRegister}
            className="w-full relative p-8 border-4 border-double border-vintageRed text-vintageRed bg-vintageRed/5 active:scale-95 transition-all transform hover:-rotate-1 group overflow-hidden"
          >
            {/* 背景纸张纹理 */}
            <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />

            <div className="flex flex-col items-center relative z-10">
              <span className="text-[10px] font-black tracking-[0.3em] mb-2 opacity-60">{t('login.castingAudition')}</span>
              <span className="text-3xl font-black tracking-tight uppercase font-retro">{t('login.findRole')}</span>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[14px] font-bold text-vintageRed/60 tracking-widest uppercase italic">{t('login.registerNow')}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* 角落的验证印章装饰 */}
            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined !text-7xl -rotate-12">verified</span>
            </div>
          </button>

          <p className="mt-6 text-[8px] font-mono text-walnut/30 uppercase tracking-[0.2em] text-center leading-relaxed">
            {t('login.registerHint')}
          </p>
        </div>
      </div>

      {/* 装饰性背景字 */}
      <div className="absolute top-[40%] -right-16 opacity-[0.02] pointer-events-none select-none -z-10">
        <span className="text-[180px] font-black rotate-90 text-walnut">CINE</span>
      </div>
    </div>
  );
};

export default Login;
