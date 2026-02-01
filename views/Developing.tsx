
import React from 'react';

const Developing: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-ink">
       <div className="relative w-full max-w-[300px] aspect-square bg-parchment-light/10 flex flex-col items-center justify-center space-y-8 rounded-sm overflow-hidden">
          <div className="absolute top-4 right-4 border-2 border-vintageRed/60 text-vintageRed/60 px-2 py-0.5 rounded text-[10px] font-black uppercase rotate-12">
            显影中
          </div>
          
          <div className="relative">
             <span className="material-symbols-outlined !text-[100px] text-white/20 animate-spin duration-[4000ms]">settings_motion_mode</span>
             <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined !text-4xl text-vintageRed animate-pulse">camera_roll</span>
             </div>
          </div>

          <div className="text-center space-y-4">
             <h3 className="text-parchment-base text-xl font-retro font-black tracking-widest leading-none">正在显影您的<br/>电影人格...</h3>
             <p className="text-parchment-base/40 text-[10px] font-mono tracking-widest animate-pulse">SCANNING FILM GRAINS // NEGATIVE PROCESSING</p>
          </div>

          <div className="absolute bottom-0 w-full flex justify-between p-1 opacity-20">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="size-1 bg-parchment-base rounded-full" />
             ))}
          </div>
       </div>
    </div>
  );
};

export default Developing;
