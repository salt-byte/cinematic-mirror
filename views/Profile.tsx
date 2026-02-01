
import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '../types';
import { ParchmentCard, Tape, Stamp } from '../components/ParchmentCard';

const ProfileView: React.FC<{ 
    profile: PersonalityProfile | null, 
    onNewRole: () => void,
    onSelectArchive: (p: PersonalityProfile) => void 
}> = ({ profile, onNewRole, onSelectArchive }) => {
  const [collection, setCollection] = useState<PersonalityProfile[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cinematic_archives');
    let existing = saved ? JSON.parse(saved) : [];
    if (profile && !existing.find((p: any) => p.id === profile.id)) {
        existing = [profile, ...existing];
        localStorage.setItem('cinematic_archives', JSON.stringify(existing));
    }
    setCollection(existing);
  }, [profile]);

  return (
    <div className="flex-1 flex flex-col bg-parchment-base pb-48 no-scrollbar overflow-y-auto min-h-screen">
      {/* 顶部：当前活跃档案 */}
      <div className="px-6 pt-12 pb-10 relative">
        <div className="absolute top-10 right-10 rotate-12 z-20">
           <Stamp text="ACTIVE" subText="In Progress" className="opacity-60" />
        </div>
        <ParchmentCard rotation="rotate-[-1deg]" className="p-8 shadow-stack">
           <div className="flex flex-col items-center">
              <div className="relative mb-8">
                 <div className="bg-white p-2 pb-10 shadow-vintage border border-black/5 transform rotate-3">
                    <img src={`https://picsum.photos/seed/${profile?.id || 'default'}/400/400`} alt="" className="w-32 h-32 object-cover grayscale brightness-90" />
                    <div className="absolute bottom-3 left-0 right-0 text-center text-[7px] font-mono text-walnut/30 uppercase tracking-widest italic">Scene Scan Ref.{profile?.id?.slice(0, 4)}</div>
                 </div>
                 <Tape className="-top-4 -left-6 w-20 rotate-[-15deg]" />
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-retro font-black text-walnut tracking-[0.1em]">{profile?.title || "暂无演出记录"}</h2>
                 <p className="text-[10px] font-serif text-walnut/40 italic tracking-widest">{profile?.subtitle || "Wait for your first take"}</p>
              </div>
           </div>
        </ParchmentCard>
      </div>

      {/* 标题：手帐贴条风格 */}
      <div className="px-10 my-6">
        <div className="inline-block relative">
           <div className="bg-walnut/5 px-6 py-1.5 -rotate-1 border border-walnut/10 shadow-sm">
              <h3 className="text-[12px] font-retro font-black text-walnut/60 tracking-[0.4em] uppercase">已收录片场档案</h3>
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
                <div className="aspect-[1/1] overflow-hidden mb-3 bg-ink relative">
                   <img src={`https://picsum.photos/seed/${role.id}/300/300`} alt="" className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
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
              “档案架尚且空空如也...”
           </div>
        )}
      </div>

      {/* 底部按钮：物理标签风格 */}
      <div className="fixed bottom-32 left-0 right-0 px-8 z-40 max-w-[430px] mx-auto">
        <div className="relative group">
           <button 
             onClick={onNewRole} 
             className="w-full bg-walnut text-parchment-light py-5 shadow-[0_10px_30px_rgba(61,43,31,0.4)] flex flex-col items-center justify-center gap-1 active:translate-y-1 active:shadow-none transition-all"
             style={{ clipPath: 'polygon(1% 0%, 99% 2%, 100% 98%, 0% 100%)' }}
           >
             <span className="text-[8px] font-bold tracking-[0.5em] uppercase opacity-30">RE-CASTING SESSION</span>
             <span className="text-sm font-retro font-black tracking-[0.3em] uppercase">重启新的人生剧本</span>
           </button>
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/20 backdrop-blur-sm shadow-sm rotate-2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
