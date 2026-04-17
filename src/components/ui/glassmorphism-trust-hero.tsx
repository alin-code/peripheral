import React from 'react';
import {
  ArrowRight,
  Play,
  Target,
  Crown,
  Star,
  MessageCircle,
  Box,
  ScanSearch,
  Palette,
  Layers3,
  User,
  LogOut,
} from 'lucide-react';

const CAPABILITIES = [
  { name: '表情包生成', icon: MessageCircle },
  { name: '三视图建模', icon: Box },
  { name: '角色识别', icon: ScanSearch },
  { name: '材质建议', icon: Palette },
  { name: '结构说明', icon: Layers3 },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex cursor-default flex-col items-center justify-center transition-transform hover:-translate-y-1">
    <span className="whitespace-nowrap text-lg font-bold text-white sm:text-2xl">{value}</span>
    <span className="whitespace-nowrap text-[9px] font-medium tracking-[0.18em] text-zinc-500 sm:text-[11px]">
      {label}
    </span>
  </div>
);

interface GlassmorphismTrustHeroProps {
  currentUser?: { id: string; email: string; username?: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateEmoticon?: () => void;
  onCreateModel?: () => void;
}

export default function HeroSection({
  currentUser,
  onLogin,
  onLogout,
  onCreateEmoticon,
  onCreateModel,
}: GlassmorphismTrustHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 font-sans text-white">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <div
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-35"
        style={{
          maskImage: 'linear-gradient(180deg, transparent, black 0%, black 70%, transparent)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent, black 0%, black 70%, transparent)',
        }}
      />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,209,138,0.16),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-8">
        <div className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-400">PERIPHERAL STUDIO</p>
            <p className="text-sm font-medium text-zinc-100">电影周边与表情包生成工作台</p>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 backdrop-blur-md sm:flex">
                <User className="h-4 w-4 text-amber-100" />
                <span>{currentUser.username || currentUser.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-100"
            >
              <User className="h-4 w-4" />
              登录 / 注册
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col justify-center space-y-8 pt-8 lg:col-span-7">
            <div className="animate-fade-in delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 sm:text-xs">
                  AI 电影素材生成
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
            </div>

            <h1
              className="animate-fade-in delay-200 max-w-4xl text-4xl font-medium leading-[0.94] tracking-tighter sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{
                maskImage: 'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
              }}
            >
              把电影素材
              <br />
              <span className="bg-gradient-to-br from-white via-white to-[#ffcd75] bg-clip-text text-transparent">
                变成表情包与建模图
              </span>
            </h1>

            <p className="animate-fade-in delay-300 max-w-xl text-lg leading-relaxed text-zinc-400">
              上传剧照或角色素材，快速得到多版本表情包与标准三视图建模说明。
            </p>

            <div className="animate-fade-in delay-400 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onCreateEmoticon}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                创建表情包
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onCreateModel}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                生成建模图
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5 lg:mt-12">
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">3-5</div>
                    <div className="text-sm text-zinc-400">每次生成多版本内容</div>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">角色还原度</span>
                    <span className="font-medium text-white">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-white to-zinc-400" />
                  </div>
                </div>

                <div className="mb-6 h-px w-full bg-white/10" />

                <div className="grid grid-cols-5 gap-4 text-center">
                  <StatItem value="1:1" label="微信比例" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="3视图" label="建模输出" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="10/5" label="当前额度" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    可用中
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    订阅版
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">核心能力</h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage:
                    'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CAPABILITIES, ...CAPABILITIES, ...CAPABILITIES].map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex cursor-default items-center gap-2 opacity-60 grayscale transition-all hover:scale-105 hover:opacity-100 hover:grayscale-0"
                    >
                      <item.icon className="h-6 w-6 fill-current text-white" />
                      <span className="text-lg font-bold tracking-tight text-white">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
