
import React, { useState, useRef } from 'react';
import { PersonalityProfile } from '../types';
import { MOVIE_DATABASE, StylingOption } from '../library';
import { useLanguage } from '../i18n/LanguageContext';

interface CharacterData {
  name: string;
  movie: string;
  matchRate: number;
  description: string;
  stylings: StylingOption[];
}

const Styling: React.FC<{ profile: PersonalityProfile | null }> = ({ profile }) => {
  const { t } = useLanguage();
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);
  const [activeStylingIndex, setActiveStylingIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const matches = profile?.matches || [];

  if (!profile || matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full space-y-6 bg-parchment-base min-h-screen">
        <div className="size-16 border border-walnut/10 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-walnut/20">auto_stories</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-retro font-black text-walnut tracking-widest">{t('styling.noArchives')}</h3>
          <p className="text-[10px] font-serif text-walnut/40 italic">{t('styling.notReady')}</p>
        </div>
      </div>
    );
  }

  // 构建角色数据，从 MOVIE_DATABASE 获取完整信息
  const characters: CharacterData[] = matches.map((match: any) => {
    const dbCharacter = MOVIE_DATABASE.find(c =>
      c.name === match.name ||
      c.id === match.characterId ||
      c.movie === match.movie
    );

    return {
      name: match.name,
      movie: match.movie,
      matchRate: match.matchRate,
      description: match.description,
      stylings: dbCharacter?.stylings || []
    };
  });

  const activeCharacter = characters[activeCharacterIndex];
  const activeStyling = activeCharacter?.stylings[activeStylingIndex];

  const handleStylingScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex !== activeStylingIndex && newIndex >= 0 && newIndex < activeCharacter.stylings.length) {
      setActiveStylingIndex(newIndex);
    }
  };

  const scrollToStyling = (index: number) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
    }
    setActiveStylingIndex(index);
  };

  const handleCharacterChange = (index: number) => {
    setActiveCharacterIndex(index);
    setActiveStylingIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'instant' });
    }
  };

  if (!activeCharacter || activeCharacter.stylings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full space-y-6 bg-parchment-base min-h-screen">
        <div className="size-16 border border-walnut/10 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-walnut/20">auto_stories</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-retro font-black text-walnut tracking-widest">{t('styling.loading')}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-parchment-base pb-40">
      {/* 页面标题 */}
      <header className="px-6 py-6 text-center space-y-2">
        <div className="text-[8px] font-mono tracking-[0.6em] text-walnut/30 uppercase">{t('styling.department')}</div>
        <h2 className="text-lg font-retro font-black text-walnut tracking-[0.15em]">{t('styling.title')}</h2>
      </header>

      {/* 角色标签页 */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {characters.map((char, i) => (
            <button
              key={i}
              onClick={() => handleCharacterChange(i)}
              className={`shrink-0 px-4 py-2.5 transition-all border ${i === activeCharacterIndex
                  ? 'bg-walnut text-parchment-base border-walnut'
                  : 'bg-transparent text-walnut/50 border-walnut/20 hover:border-walnut/40'
                }`}
            >
              <div className="text-[11px] font-black tracking-wider">{char.name}</div>
              <div className="text-[8px] opacity-60 mt-0.5">《{char.movie}》</div>
            </button>
          ))}
        </div>
      </div>

      {/* 匹配度显示 */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-walnut/40">{t('styling.matchRate')}</span>
          <div className="flex-1 h-1 bg-walnut/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-vintageRed transition-all duration-500"
              style={{ width: `${activeCharacter.matchRate}%` }}
            />
          </div>
          <span className="text-vintageRed font-black">{activeCharacter.matchRate}%</span>
        </div>
        <p className="text-[11px] text-walnut/50 mt-2 italic font-serif leading-relaxed">
          {activeCharacter.description}
        </p>
      </div>

      {/* 可滑动造型区域 - 每套造型有独立的图片和分析 */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleStylingScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {activeCharacter.stylings.map((styling, i) => (
            <div
              key={i}
              className="w-full shrink-0 snap-center px-4"
            >
              <div className="bg-[#1a1a1a] p-1 pb-8 shadow-xl relative group">
                {/* 胶片装饰头 */}
                <div className="flex justify-between px-3 py-1.5 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="size-1.5 rounded-full bg-white/20" />
                    <div className="size-1.5 rounded-full bg-white/20" />
                  </div>
                  <span className="text-[7px] text-white/30 tracking-[0.3em] font-mono uppercase">
                    LOOK {i + 1} / {activeCharacter.stylings.length}
                  </span>
                  <div className="flex gap-1.5">
                    <div className="size-1.5 rounded-full bg-white/20" />
                    <div className="size-1.5 rounded-full bg-white/20" />
                  </div>
                </div>
                {/* 核心影像 */}
                <div className="relative overflow-hidden aspect-[3/4] bg-ink">
                  <img
                    src={styling.image}
                    alt={styling.title}
                    className="w-full h-full object-contain grayscale-[0.2] contrast-[1.1]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  {/* 标题叠加 */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-retro font-black tracking-wide drop-shadow-lg">
                      {styling.title}
                    </h3>
                    <p className="text-white/60 text-[10px] mt-1 tracking-widest">
                      {styling.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 造型指示器 */}
        {activeCharacter.stylings.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {activeCharacter.stylings.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToStyling(i)}
                className={`transition-all ${i === activeStylingIndex
                    ? 'w-6 h-1.5 bg-vintageRed'
                    : 'w-1.5 h-1.5 bg-walnut/20'
                  } rounded-full`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 当前造型的详细分析 - 随滑动变化 */}
      {activeStyling && (
        <div className="px-6 mt-8 space-y-8 animate-in fade-in duration-300" key={`${activeCharacterIndex}-${activeStylingIndex}`}>
          {/* 色彩构图 */}
          <div className="space-y-4">
            <h3 className="font-black text-[9px] uppercase tracking-widest text-walnut/40 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-walnut/20"></span> {t('styling.palette')}
            </h3>
            <div className="flex items-center gap-5">
              <div className="flex -space-x-3">
                {activeStyling.palette?.slice(0, 3).map((p, idx) => (
                  <div
                    key={idx}
                    className="size-12 rounded-full border-4 border-parchment-base shadow-md"
                    style={{ backgroundColor: p.hex, zIndex: 30 - idx }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-walnut leading-tight">
                  {activeStyling.palette?.map(p => p.name).join(' · ')}
                </p>
                <p className="text-[9px] text-walnut/40 font-mono mt-1 uppercase tracking-tight">
                  {activeStyling.palette?.map(p => p.enName || 'Color').join(' / ')}
                </p>
              </div>
            </div>
          </div>

          {/* 材质与剪裁 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 p-4 border border-walnut/10">
              <h4 className="text-[10px] font-black text-vintageRed uppercase mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">texture</span> {t('styling.materials')}
              </h4>
              <ul className="text-[11px] space-y-1.5 text-walnut/70 font-serif">
                {activeStyling.materials?.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="mt-1 size-1 bg-vintageRed/30 rounded-full shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/50 p-4 border border-walnut/10">
              <h4 className="text-[10px] font-black text-vintageRed uppercase mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">apparel</span> {t('styling.tailoring')}
              </h4>
              <ul className="text-[11px] space-y-1.5 text-walnut/70 font-serif">
                {activeStyling.tailoring?.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="mt-1 size-1 bg-vintageRed/30 rounded-full shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 剧本片段 */}
          <div className="space-y-3">
            <h3 className="font-black text-[9px] uppercase tracking-widest text-walnut/40 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-walnut/20"></span> {t('styling.characterStory')}
            </h3>
            <div className="bg-white/30 p-5 border-l-2 border-walnut/20">
              <p className="text-[10px] font-mono text-walnut/30 uppercase tracking-widest mb-2">
                INT. {activeCharacter.movie.toUpperCase()} - CONTINUOUS
              </p>
              <p className="text-[12px] font-serif text-walnut/70 italic leading-relaxed">
                {activeStyling.scriptSnippet}
              </p>
            </div>
          </div>

          {/* 导演点评 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-retro font-black text-lg text-vintageRed">{t('styling.directorComment')}</h3>
              <span className="text-[9px] text-walnut/30 font-bold tracking-tighter uppercase mt-0.5">{t('styling.directorNote')}</span>
            </div>
            <div className="relative p-5 bg-walnut/[0.03] border-l-4 border-vintageRed/30">
              <span className="material-symbols-outlined absolute -top-2 -right-1 text-vintageRed/10 text-4xl font-light pointer-events-none">format_quote</span>
              <p className="text-[13px] leading-relaxed text-walnut/80 font-serif italic">
                {activeStyling.directorNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Styling;
