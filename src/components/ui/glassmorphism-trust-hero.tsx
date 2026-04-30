import React from 'react';
import {
  ArrowRight,
  Box,
  Check,
  LogOut,
  MessageCircle,
  Play,
  Sparkles,
  User,
} from 'lucide-react';

const PREVIEW_ITEMS = [
  { label: '表情包版本', value: '3-5' },
  { label: '建模输出', value: '3视图' },
  { label: '素材处理', value: '剧照/海报' },
];

const OUTPUTS = [
  { icon: MessageCircle, title: '表情包', text: '短文案、多情绪、适合聊天传播' },
  { icon: Box, title: '建模图', text: '正侧背三视图、材质与尺寸建议' },
];

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
    <section className="relative min-h-[86vh] overflow-hidden text-white">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,8,10,0.7)_0%,rgba(13,12,15,0.48)_45%,rgba(13,12,15,0.16)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0f0d10]/68 to-transparent" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="design-topbar flex flex-col gap-4 rounded-lg px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/52">Peripheral Studio</p>
            <p className="mt-1 text-sm font-medium text-white">电影素材生成工作台</p>
          </div>

          {currentUser ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/86">
                <User className="h-4 w-4 text-[#ffcf75]" />
                <span>{currentUser.username || currentUser.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/14"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#151216] transition-colors hover:bg-[#f7f2eb]"
            >
              <User className="h-4 w-4" />
              登录 / 注册
            </button>
          )}
        </div>

        <div className="flex flex-1 items-center py-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/78 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#ffcf75]" />
              从电影素材到可传播内容
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
              电影周边建模与表情包定制服务
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              上传剧照、海报或角色素材，快速生成聊天表情包与商家可用的三视图建模参考。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onCreateEmoticon}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#151216] transition-transform hover:-translate-y-0.5 hover:bg-[#f7f2eb]"
              >
                创建表情包
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onCreateModel}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/14"
              >
                <Play className="h-4 w-4 fill-current" />
                生成建模图
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-[#171513] md:grid-cols-[1fr_1fr_1.2fr]">
          {PREVIEW_ITEMS.map((item) => (
            <div key={item.label} className="rounded-lg border border-[#e7ddd1] bg-white/92 p-4 shadow-[0_18px_50px_rgba(16,13,10,0.12)] backdrop-blur">
              <div className="text-2xl font-semibold">{item.value}</div>
              <div className="mt-1 text-sm text-[#74695d]">{item.label}</div>
            </div>
          ))}

          <div className="rounded-lg border border-[#171513] bg-[#171513] p-4 text-white shadow-[0_18px_50px_rgba(16,13,10,0.18)] md:col-span-3 lg:col-span-1">
            <div className="flex flex-wrap gap-3">
              {OUTPUTS.map((item) => (
                <div key={item.title} className="flex min-w-[220px] flex-1 gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <item.icon className="h-4 w-4 text-[#ffcf75]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Check className="h-3.5 w-3.5 text-[#ffcf75]" />
                      {item.title}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/62">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
