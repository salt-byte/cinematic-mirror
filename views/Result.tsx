
import React from 'react';
import { PersonalityProfile } from '../types';
import { Stamp, Tape } from '../components/ParchmentCard';
import { MOVIE_DATABASE } from '../library';

interface ResultProps {
  profile: PersonalityProfile | null;
  onContinue: () => void;
}

const Result: React.FC<ResultProps> = ({ profile, onContinue }) => {
  if (!profile) return null;

  const angles = Array.isArray(profile.angles) ? profile.angles : [];
  const matches = Array.isArray(profile.matches) ? profile.matches : [];

  return (
    <div className="flex-1 overflow-y-auto pb-60 bg-parchment-base animate-in fade-in duration-1000 no-scrollbar relative">
       {/* 档案顶部：绝密印记 */}
       <header className="pt-16 px-10 flex justify-between items-end border-b border-walnut/10 pb-8 relative">
         <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-vintageRed text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-[0.2em] uppercase">TOP SECRET</span>
              <p className="font-mono text-[8px] text-walnut/30 uppercase tracking-[0.4em]">DOSSIER #LY_{profile.id?.slice(0,4).toUpperCase()}</p>
            </div>
            <h1 className="text-4xl font-retro font-black text-walnut tracking-tighter leading-none">{profile.title}</h1>
            <p className="text-[11px] text-walnut/40 font-serif italic tracking-widest">{profile.subtitle}</p>
         </div>
         <div className="absolute top-12 right-6 -rotate-12">
            <Stamp text="VERIFIED" subText="人格核验" className="opacity-70 scale-90" />
         </div>
       </header>

       {/* 1. 灵魂底片：核心画像 */}
       <section className="mt-12 px-10">
          <div className="bg-white/50 p-10 shadow-stack border border-walnut/5 relative overflow-hidden">
             <div className="flex items-center gap-2 mb-8">
                <div className="size-1 bg-vintageRed" />
                <h2 className="font-black text-[10px] uppercase tracking-[0.4em] text-walnut/30">核心人格画像 / Core Portrait</h2>
             </div>
             <div className="relative z-10">
               <p className="font-serif text-walnut text-2xl leading-[1.8] italic font-black mb-10">
                  “{profile.narrative}”
               </p>
               <p className="text-[14px] font-serif text-walnut/70 leading-[2.2] tracking-wide text-justify indent-8">
                   {profile.analysis}
                </p>
             </div>
             <div className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12 pointer-events-none">
                <span className="material-symbols-outlined !text-[150px]">fingerprint</span>
             </div>
          </div>
       </section>

       {/* 2. 导演笔记：五个维度的切片 (新增强调版) */}
       <section className="mt-20 px-10">
          <div className="flex items-center gap-4 mb-12">
             <h3 className="font-retro font-black text-sm text-walnut/40 tracking-[0.5em] uppercase">导演手记：人格维度 / DIRECTOR'S NOTES</h3>
             <div className="h-px flex-1 bg-walnut/10" />
          </div>
          
          <div className="space-y-12">
            {angles.map((angle, i) => (
              <div key={i} className="relative group">
                 <div className="flex gap-6">
                    <div className="w-8 shrink-0">
                       <span className="text-[20px] font-retro font-black text-vintageRed/20 leading-none">0{i+1}</span>
                    </div>
                    <div className="flex-1">
                       <h4 className="text-[10px] font-black text-walnut/40 tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                          {angle.label}
                          <span className="h-px w-4 bg-walnut/5" />
                       </h4>
                       <div className="relative p-5 bg-walnut/[0.02] border-l-2 border-vintageRed/10 italic">
                          <p className="text-[14px] font-serif text-walnut/80 leading-relaxed tracking-wider">
                             {angle.essence}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
       </section>

       {/* 3. 灵魂共振：影人匹配 */}
       <section className="mt-24 px-10 pb-40">
          <div className="bg-ink p-12 relative overflow-hidden rounded-sm">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px'}} />
             
             <div className="relative z-10 space-y-16">
                <header className="text-center">
                   <h3 className="font-retro font-black text-xs text-parchment-base/30 tracking-[0.6em] uppercase">灵魂共振角色 / CASTING MATCHES</h3>
                </header>

                <div className="grid grid-cols-1 gap-20">
                  {matches.map((match, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                       <div className="w-full max-w-[220px] aspect-[3/4] bg-white/5 p-1 relative shadow-2xl mb-8 group overflow-hidden">
                          <img
                            src={(() => {
                              const character = MOVIE_DATABASE.find(c => c.name === match.name || c.id === match.characterId);
                              return character?.stylings?.[0]?.image || `https://picsum.photos/seed/${match.name}/400/600`;
                            })()}
                            className="w-full h-full object-cover object-top grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-4 left-4">
                             <div className="bg-vintageRed text-white text-[9px] font-black py-1 px-2 w-fit tracking-widest shadow-lg">
                                {match.matchRate}% MATCH
                             </div>
                          </div>
                       </div>
                       <div className="text-center space-y-3 max-w-[300px]">
                          <h4 className="font-retro font-black text-2xl text-parchment-base tracking-[0.2em]">《{match.movie}》</h4>
                          <p className="text-[11px] font-mono text-vintageRed tracking-[0.3em] font-black uppercase">Role: {match.name}</p>
                          <p className="text-[12px] font-serif text-parchment-base/40 italic leading-[2] pt-4">
                             “{match.description}”
                          </p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
       </section>

       {/* 底部按钮：物理重感 */}
       <div className="fixed bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-parchment-base via-parchment-base to-transparent z-50 max-w-[430px] mx-auto">
          <button 
            onClick={onContinue} 
            className="w-full h-20 bg-walnut text-parchment-light shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group"
            style={{ clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 0% 100%)' }}
          >
            <span className="text-[8px] font-bold tracking-[0.5em] uppercase opacity-40 group-hover:opacity-60">Proceed to Styling</span>
            <span className="text-sm font-retro font-black tracking-[0.4em] uppercase">开始造型演绎 →</span>
          </button>
       </div>
    </div>
  );
};

export default Result;
