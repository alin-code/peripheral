'use client';

import { Button } from '@/components/ui/button';
import { PrismaHero } from '@/components/ui/prisma-hero';
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Clock3,
  MessageCircle,
  Palette,
  ScanSearch,
  Shield,
} from 'lucide-react';

interface ServiceSelectProps {
  onSelectService: (service: 'emoticon' | 'model') => void;
  onLogin?: () => void;
  currentUser?: { id: string; email: string; username?: string } | null;
  onLogout?: () => void;
}

const CAPABILITIES = [
  {
    icon: MessageCircle,
    title: '表情包生成',
    description: '围绕角色表情与场景，输出适合社交传播的短文案版本。',
    tone: 'bg-[#3a2b20] text-[#ffcf75]',
  },
  {
    icon: Box,
    title: '三视图建模',
    description: '生成正面、侧面、背面参考，方便商家快速沟通。',
    tone: 'bg-[#20313a] text-[#8ddcff]',
  },
  {
    icon: ScanSearch,
    title: '角色识别',
    description: '保留五官、服装和气质，让结果不脱离上传素材。',
    tone: 'bg-[#302a25] text-[#d6c2a6]',
  },
  {
    icon: Palette,
    title: '材质建议',
    description: '补充树脂、毛绒、PVC 等方向，让视觉更接近落地生产。',
    tone: 'bg-[#233026] text-[#9ed6a6]',
  },
];

const WORKFLOWS = [
  { step: '01', title: '上传素材', description: '剧照、海报或角色截图。' },
  { step: '02', title: '填写需求', description: '角色名、场景、材质偏好。' },
  { step: '03', title: '生成结果', description: '表情包或建模参考图。' },
];

export default function ServiceSelect({
  onSelectService,
  onLogin,
  currentUser,
  onLogout,
}: ServiceSelectProps) {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-[#111014] [scroll-snap-type:y_mandatory]">
      <div className="[scroll-snap-align:start]">
        <PrismaHero
          currentUser={currentUser}
          onLogin={onLogin}
          onLogout={onLogout}
          onCreateEmoticon={() => onSelectService('emoticon')}
          onCreateModel={() => onSelectService('model')}
        />
      </div>

      <section
        id="capabilities"
        className="cinema-blur-section min-h-screen [scroll-snap-align:start]"
      >
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-white/48">Studio Tools</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
              选择你要生成的内容
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/62">
              首屏负责品牌和入口，下滑后进入功能工作台。这里承接之前的影院虚化背景。
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="rounded-lg border border-white/10 bg-[#19161a]/82 p-6 text-white shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-7">
              <div className="grid gap-4 md:grid-cols-2">
                {CAPABILITIES.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-lg border border-white/10 bg-white/[0.055] p-5 transition-transform hover:-translate-y-1 hover:bg-white/[0.08]"
                  >
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${item.tone}`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/62">{item.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => onSelectService('emoticon')}
                  className="group flex items-center justify-between rounded-lg border border-[#f5c76d]/60 bg-[#f2c66d] px-5 py-4 text-left text-[#17130d] shadow-[0_14px_36px_rgba(242,198,109,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#ffdc8a] hover:shadow-[0_18px_46px_rgba(242,198,109,0.28)]"
                >
                  <span>
                    <span className="block text-sm text-[#17130d]/58">Service 01</span>
                    <span className="mt-1 block font-semibold">创建表情包</span>
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => onSelectService('model')}
                  className="group flex items-center justify-between rounded-lg border border-[#7ddcff]/50 bg-[#214353] px-5 py-4 text-left text-white shadow-[0_14px_36px_rgba(69,190,235,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#2c5a70] hover:shadow-[0_18px_46px_rgba(69,190,235,0.22)]"
                >
                  <span>
                    <span className="block text-sm text-white/58">Service 02</span>
                    <span className="mt-1 block font-semibold">生成建模图</span>
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <aside className="design-panel-dark rounded-lg p-6 text-white sm:p-7">
              <p className="text-sm uppercase tracking-[0.24em] text-white/46">Workflow</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-normal">工作流</h3>

              <div className="mt-6 space-y-4">
                {WORKFLOWS.map((item) => (
                  <div key={item.step} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-xs tracking-[0.22em] text-[#ffcf75]">{item.step}</div>
                    <div className="mt-2 text-lg font-semibold">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-white/68">{item.description}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/68">
                    <BadgeCheck className="h-4 w-4 text-emerald-300" />
                    当前额度
                  </span>
                  <span className="text-sm text-white/86">10 / 5</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/68">
                  <Clock3 className="h-4 w-4 text-[#ffcf75]" />
                  推荐先用表情包确认视觉方向
                </div>
              </div>

              {!currentUser && (
                <Button
                  onClick={onLogin}
                  className="mt-6 h-12 w-full rounded-full bg-[#E1E0CC] text-[#111014] hover:bg-white"
                >
                  登录后开始生成
                </Button>
              )}
            </aside>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/28 px-4 py-2 text-sm text-white/64 backdrop-blur">
            <Shield className="h-4 w-4 text-[#ffcf75]" />
            输出围绕用户上传素材，不脱离角色本身。
          </div>
        </div>
      </section>
    </main>
  );
}
