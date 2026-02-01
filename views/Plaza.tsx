
import React, { useState, useEffect } from 'react';
import { ParchmentCard, Tape } from '../components/ParchmentCard';

const POSTS = [
  {
    author: "@张曼玉的小号",
    loc: "于上海·胶片洗印于19:42",
    content: "在香港的雨夜，寻找一种复古的情绪。光影在潮湿的地面上拉得很长，像是某些未曾说出口的告别。",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtTWjiFNS8UYcLQpx-LTuc4_gWmvCEi0hi4uQjESH6Csd56nsrxdGcoHTmmRo3Pn29L1tOH19XmYEkjY4QZ8-MHixQlBPeG3Sw6cUHgA1HbvQF6IvnXVxZ5GKnEimM3h7Ri0EuARFCgtyz1fUgKTFUcIW_LEPKJdSyIp-NobvIwgDvfbsSnPdz901KrPHZmmrbUxwf4-HJbMVKN82csmxLQxy1YtkLhTw0HHpH6GSap8f-oHtYnMFMWBpvWbubR24uOhd_uLrhyv8",
    likes: "1,248",
    comments: "84",
    mood: "wong-kar-wai"
  },
  {
    author: "@古典美学馆",
    loc: "于伦敦·18:15 存档",
    content: "“茶杯里的倒影，是下午三点最温柔的秘密。” 凉亭里的下午茶，摄政时期的优雅复现。",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZUF87pJuVjxFfY92tJ4bavGfXN2I6kCXiJsEoCpLqVQvC6v9HVnjx7weTnzcvEjYjYZJvzDjrjuKMsLxsag7bUvozySRhV7iTusmXw6Aw3N07E4eFxKDUGpdDukhQnhMtVnuP2sUItkznhOW5chg_Za1ZHaA6GWU5zn_ie0ztqa_2nR2e028bKh0Y8knXJbKNiVTvIYtXf5kaUwPtTwJsymU-HfjZo_PqPWLkEP5OlrPLwqRJzGr5HcC66WPQn299m2vdvV04R2M",
    likes: "956",
    comments: "42",
    mood: "golden-hour",
    caption: "Scene No. 42 - Tea Time"
  },
  {
    author: "@泰勒影迷会",
    loc: "洛杉矶分部·昨日归档",
    content: "FILM NOIR TECHNICOLOR // PROJECT CHAOS",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMMyJGXuP5XsHV9aYAzaFxnkF1vz7a0kRr0L-5ebQCGXjl-QP6-K4MsHyIOCJ_xfW6DPQo4OHBRMCOIgyBPdKj9_HERy-1mtxb2oXNTHx08XcfzAZGWyOLUglP5UopiZwAfJmsQBDn3OsUI9FwZ8Kn7YI08HPkq4BxRHUGGlWa7kt1xlPjLjW_0SDoKlykmZdyhnAOmKp5BNDSxlh9XWnwlARUiKx4gCewvAYXTg8CRYMw1EPHiGD9iaMEqdD6ubOFeQWbfK0FTaI",
    likes: "2.4k",
    comments: "156",
    mood: "technicolor",
    isProject: true
  }
];

const Plaza: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="flex flex-col h-full desk-texture relative">
      {/* 开发中弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <div className="bg-parchment-base border border-walnut/20 shadow-2xl p-8 mx-6 max-w-sm text-center space-y-6 relative">
            {/* 装饰胶带 */}
            <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2 w-20" />

            <div className="pt-4 space-y-4">
              <span className="material-symbols-outlined text-4xl text-walnut/30">movie_filter</span>
              <h3 className="text-lg font-retro font-black text-walnut tracking-widest">功能开发中</h3>
              <p className="text-[12px] font-serif text-walnut/60 leading-relaxed italic">
                "电影广场正在紧锣密鼓地筹备中，<br/>
                敬请期待更多精彩内容。"
              </p>
              <p className="text-[9px] font-mono text-walnut/30 uppercase tracking-widest">
                Coming Soon · Studio Archives
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-6 py-2.5 bg-walnut/10 hover:bg-walnut/20 text-walnut text-[11px] font-black tracking-widest uppercase transition-colors"
            >
              先看看效果
            </button>
          </div>
        </div>
      )}
      {/* Search/Filter Bar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-walnut/10 bg-parchment-base/40 backdrop-blur-md sticky top-0 z-30">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {['全集动态', '热门短片', '洗印店', '手绘分镜'].map((tab, idx) => (
            <a key={idx} href="#" className={`relative shrink-0 font-black text-sm tracking-widest ${idx === 0 ? 'text-walnut' : 'text-walnut/40'}`}>
              {tab}
              {idx === 0 && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-vintageRed/80 blur-[0.5px]" />}
            </a>
          ))}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-6 space-y-12 no-scrollbar pb-32">
        {POSTS.map((post, i) => (
          <article key={i} className="relative group transition-all duration-500">
            {/* Real Tapes */}
            {i % 2 === 0 ? (
              <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-1 w-24" />
            ) : (
              <Tape className="top-12 -left-8 -rotate-45 w-20 opacity-40" />
            )}

            <ParchmentCard 
              edgeType="zigzag" 
              className={`p-2 pb-6 transform transition-transform group-hover:rotate-0 group-hover:scale-[1.01] ${i % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.8deg]'}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-sm bg-walnut/10 border border-walnut/10 overflow-hidden shadow-sm">
                    <img src={`https://picsum.photos/seed/${post.author}/100/100`} alt="" className="w-full h-full object-cover grayscale saturate-50" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-widest text-walnut">{post.author}</h4>
                    <p className="text-[8px] text-walnut/40 font-mono italic mt-0.5">{post.loc}</p>
                  </div>
                </div>
              </div>

              {/* Photo Frame */}
              <div className="px-2">
                <div className={`relative bg-ink p-1 shadow-stack border border-black/5 overflow-hidden group-hover:brightness-105 transition-all duration-300`}>
                   <img src={post.img} alt="" className="w-full h-auto object-cover opacity-95 group-hover:opacity-100" />
                   
                   {/* Cinematic Overlays */}
                   {post.mood === 'wong-kar-wai' && (
                     <div className="absolute top-2 right-2 size-2.5 bg-vintageRed rounded-full shadow-md border-b-2 border-black/40" />
                   )}
                   {post.caption && (
                      <div className="absolute bottom-3 left-3 bg-white/80 p-1 px-2 text-[8px] font-retro rotate-[-2deg] shadow-sm border border-walnut/5 text-walnut">
                        {post.caption}
                      </div>
                   )}
                </div>
              </div>

              {/* Content */}
              <div className="px-4 mt-6 space-y-5">
                 {post.isProject ? (
                    <div className="border-l-4 border-vintageRed pl-3">
                      <p className="text-xs font-black tracking-[0.15em] text-walnut uppercase leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                 ) : (
                    <p className="text-sm leading-relaxed text-walnut font-serif first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                      {post.content}
                    </p>
                 )}
                 
                 {/* Interactions */}
                 <div className="flex items-center justify-between pt-4 border-t border-walnut/5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-6">
                       <button className="flex items-center gap-1.5 text-walnut hover:text-vintageRed transition-colors">
                          <span className="material-symbols-outlined text-lg">favorite</span>
                          <span className="text-[10px] font-black font-mono mt-0.5">{post.likes}</span>
                       </button>
                       <button className="flex items-center gap-1.5 text-walnut hover:text-vintageRed transition-colors">
                          <span className="material-symbols-outlined text-lg">chat</span>
                          <span className="text-[10px] font-black font-mono mt-0.5">{post.comments}</span>
                       </button>
                    </div>
                    <button className="text-walnut/60 hover:text-walnut">
                      <span className="material-symbols-outlined text-lg">share</span>
                    </button>
                 </div>
              </div>
            </ParchmentCard>
          </article>
        ))}
      </div>

      {/* Improved Floating Action Wax Seal */}
      <div className="fixed bottom-28 right-6 z-40">
        <button className="wax-seal size-16 rounded-full flex items-center justify-center text-white/95 active:scale-95 transition-all group hover:scale-105">
          <span className="material-symbols-outlined text-3xl font-light group-hover:rotate-12 transition-transform">edit_square</span>
          <div className="absolute inset-0 rounded-full border border-white/20 scale-90" />
        </button>
      </div>
    </div>
  );
};

export default Plaza;
