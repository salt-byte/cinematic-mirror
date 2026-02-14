
import React, { useState, useEffect } from 'react';
import { login, forgotPassword, resetPassword } from '../apiService';
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

  // 重置密码相关状态
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 倒计时
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('login.errorEmpty'));
      return;
    }
    setLoading(true);
    setError("");
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
    try {
      await forgotPassword(email);
      setShowResetForm(true);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || t('login.forgotPasswordError'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) {
      setError(t('login.errorEmpty'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('register.errorPassword'));
      return;
    }
    setResetLoading(true);
    setError("");
    try {
      await resetPassword(email, resetCode, newPassword);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || t('login.resetError'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetSuccess(false);
    setResetCode("");
    setNewPassword("");
    setError("");
  };

  // 重置密码成功页
  if (resetSuccess) {
    return (
      <div className="flex-1 flex flex-col paper-texture bg-parchment-base relative overflow-hidden items-center justify-center px-8" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex flex-col items-center gap-6 max-w-sm w-full">
          <span className="material-symbols-outlined text-green-600 !text-6xl">check_circle</span>
          <p className="text-walnut text-lg font-bold text-center">{t('login.resetSuccess')}</p>
          <button
            onClick={handleBackToLogin}
            className="w-full bg-walnut text-parchment-light py-4 shadow-stack flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-lg font-black tracking-[0.2em]">{t('login.backToLogin')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 重置密码表单（验证码 + 新密码）
  if (showResetForm) {
    return (
      <div className="flex-1 flex flex-col paper-texture bg-parchment-base relative overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* 顶部区域 */}
        <div className="relative w-full shrink-0" style={{ height: 'calc(env(safe-area-inset-top, 0px) + 120px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="absolute inset-0 bg-walnut/5"></div>
          <button onClick={handleBackToLogin} className="absolute top-4 left-4 z-20 size-10 rounded-full bg-black/10 backdrop-blur flex items-center justify-center active:scale-95 transition-transform" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}>
            <span className="material-symbols-outlined text-walnut">arrow_back</span>
          </button>
          <div className="absolute bottom-6 left-8 right-8">
            <span className="bg-vintageRed text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-[0.3em] uppercase shadow-lg">PASSWORD RESET</span>
            <h1 className="text-walnut text-2xl font-black tracking-tighter mt-2">{t('login.resetPassword')}</h1>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 px-8 pt-8 z-10 flex flex-col">
          <div className="space-y-5">
            <p className="text-walnut/60 text-sm font-serif">{t('login.forgotPasswordSent')}</p>
            <p className="text-walnut/40 text-xs font-mono">{email}</p>

            {/* 验证码输入 */}
            <div className="space-y-2">
              <label className="text-walnut/40 text-[9px] font-black tracking-[0.2em] flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-[14px]">pin</span>
                {t('login.verificationCode')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full h-14 bg-white/30 border-b-2 border-walnut/10 focus:border-vintageRed px-0 text-walnut font-mono text-2xl tracking-[0.5em] text-center transition-all outline-none"
                placeholder="000000"
              />
            </div>

            {/* 新密码输入 */}
            <div className="space-y-2">
              <label className="text-walnut/40 text-[9px] font-black tracking-[0.2em] flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-[14px]">key</span>
                {t('login.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 bg-white/30 border-b-2 border-walnut/10 focus:border-vintageRed px-0 text-walnut font-mono transition-all outline-none"
                placeholder={t('login.newPasswordPlaceholder')}
              />
            </div>

            {error && (
              <p className="text-vintageRed text-sm font-serif text-center">{error}</p>
            )}

            {/* 确认重置按钮 */}
            <button
              onClick={handleResetPassword}
              disabled={resetLoading || resetCode.length !== 6 || !newPassword}
              className="w-full mt-4 bg-walnut text-parchment-light py-5 shadow-stack flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group disabled:opacity-50"
            >
              <span className="text-[8px] font-bold tracking-[0.4em] uppercase opacity-40">CONFIRM RESET</span>
              <span className="text-xl font-black tracking-[0.2em]">{resetLoading ? t('login.resetting') : t('login.resetSubmit')}</span>
            </button>

            {/* 重新发送验证码 */}
            <div className="text-center pt-2">
              <button
                onClick={handleForgotPassword}
                disabled={resendCooldown > 0 || forgotLoading}
                className="text-vintageRed/70 text-[12px] font-medium hover:text-vintageRed transition-colors underline disabled:opacity-40 disabled:no-underline"
              >
                {resendCooldown > 0
                  ? t('login.resendCooldown', { n: resendCooldown })
                  : forgotLoading ? '...' : t('login.resendCode')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 登录主页面
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
