'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/ui/glassmorphism-trust-hero';
import {
  MessageCircle,
  Box,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react';

interface ServiceSelectProps {
  onSelectService: (service: 'emoticon' | 'model') => void;
  onLogin?: () => void;
  currentUser?: { id: string; email: string; username?: string } | null;
  onLogout?: () => void;
}

export default function ServiceSelect({
  onSelectService,
  onLogin,
  currentUser,
  onLogout,
}: ServiceSelectProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <HeroSection
        currentUser={currentUser}
        onLogin={onLogin}
        onLogout={onLogout}
        onCreateEmoticon={() => onSelectService('emoticon')}
        onCreateModel={() => onSelectService('model')}
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,240,222,0.1),rgba(255,255,255,0.04))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0d8] text-[#2d1d14] shadow-lg">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.26em] text-white/42">服务一</p>
                    <h3 className="mt-1 text-3xl font-semibold text-[#fff5ea]">表情包生成</h3>
                  </div>
                </div>
                <Badge className="rounded-full border-0 bg-white/10 px-3 py-1 text-white/78">热门</Badge>
              </div>

              <p className="max-w-xl text-base leading-8 text-white/60">
                多版本表情包输出，适合社交平台传播。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/18 p-4">
                  <Sparkles className="mb-3 h-5 w-5 text-amber-200" />
                  <p className="text-sm text-white/82">高清画质</p>
                  <p className="mt-1 text-xs leading-6 text-white/46">角色特征稳定</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-black/18 p-4">
                  <Clock className="mb-3 h-5 w-5 text-cyan-200" />
                  <p className="text-sm text-white/82">批量输出</p>
                  <p className="mt-1 text-xs leading-6 text-white/46">一次生成 3-5 个版本</p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(174,223,255,0.1),rgba(255,255,255,0.04))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff6ff] text-[#14222c] shadow-lg">
                    <Box className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.26em] text-white/42">服务二</p>
                    <h3 className="mt-1 text-3xl font-semibold text-[#f0fbff]">周边建模图</h3>
                  </div>
                </div>
                <Badge className="rounded-full border-0 bg-white/10 px-3 py-1 text-white/78">商家</Badge>
              </div>

              <p className="max-w-xl text-base leading-8 text-white/60">
                输出更规范的角色建模方案，方便商家沟通。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/18 p-4">
                  <Box className="mb-3 h-5 w-5 text-cyan-200" />
                  <p className="text-sm text-white/82">标准三视图</p>
                  <p className="mt-1 text-xs leading-6 text-white/46">正 / 侧 / 背完整</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-black/18 p-4">
                  <Shield className="mb-3 h-5 w-5 text-emerald-200" />
                  <p className="text-sm text-white/82">尺寸与材质</p>
                  <p className="mt-1 text-xs leading-6 text-white/46">适合生产沟通</p>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] p-7 backdrop-blur-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/38">额度概览</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/78">表情包额度</span>
                    <span className="text-2xl font-semibold text-[#fff1de]">0 / 10</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-1/12 rounded-full bg-[linear-gradient(90deg,#ffebc7,#ffb86b)]" />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/78">建模图额度</span>
                    <span className="text-2xl font-semibold text-[#edf9ff]">0 / 5</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-1/12 rounded-full bg-[linear-gradient(90deg,#dcf5ff,#6ec8ff)]" />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                {!currentUser ? (
                  <Button
                    onClick={onLogin}
                    className="h-12 w-full rounded-full bg-[#fff1db] text-[#26170f] hover:bg-white"
                  >
                    登录获取更多额度
                  </Button>
                ) : (
                  <div className="rounded-[1.5rem] border border-emerald-300/18 bg-emerald-400/8 p-4 text-sm text-emerald-100/80">
                    当前账号可直接开始生成。
                  </div>
                )}
              </div>
            </div>
          </section>
      </div>
    </div>
  );
}
