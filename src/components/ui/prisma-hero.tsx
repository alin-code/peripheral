'use client';

import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Box,
  LogOut,
  MessageCircle,
  Play,
  Sparkles,
  User,
} from 'lucide-react';
import { useRef } from 'react';

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({
  text,
  className = '',
  showAsterisk = false,
  style,
}: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, index) => {
        const isLast = index === words.length - 1;

        return (
          <motion.span
            key={`${word}-${index}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : '0.25em' }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute -right-[0.28em] top-[0.68em] text-[0.26em] text-[#ffcf75]">
                *
              </span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({
  segments,
  className = '',
  style,
}: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words: { word: string; className?: string }[] = [];

  segments.forEach((segment) => {
    segment.text.split(' ').forEach((word) => {
      if (word) {
        words.push({ word, className: segment.className });
      }
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((item, index) => (
        <motion.span
          key={`${item.word}-${index}`}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`inline-block ${item.className ?? ''}`}
          style={{ marginRight: '0.25em' }}
        >
          {item.word}
        </motion.span>
      ))}
    </div>
  );
};

interface PrismaHeroProps {
  currentUser?: { id: string; email: string; username?: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateEmoticon?: () => void;
  onCreateModel?: () => void;
}

const navItems = [
  { label: '表情包', action: 'emoticon' },
  { label: '建模图', action: 'model' },
  { label: '流程', href: '#workflow' },
  { label: '能力', href: '#capabilities' },
] as const;

export const PrismaHero = ({
  currentUser,
  onLogin,
  onLogout,
  onCreateEmoticon,
  onCreateModel,
}: PrismaHeroProps) => {
  const handleNavClick = (item: (typeof navItems)[number]) => {
    if ('action' in item && item.action === 'emoticon') {
      onCreateEmoticon?.();
      return;
    }

    if ('action' in item && item.action === 'model') {
      onCreateModel?.();
      return;
    }
  };

  return (
    <section className="h-screen min-h-[720px] w-full px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111014] shadow-[0_30px_120px_rgba(0,0,0,0.42)] md:rounded-[2rem]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.08)_36%,rgba(0,0,0,0.7)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.56),transparent_62%)]" />

        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-5 md:gap-9 md:rounded-b-3xl md:px-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={'href' in item ? item.href : '#'}
                onClick={(event) => {
                  if ('action' in item) {
                    event.preventDefault();
                    handleNavClick(item);
                  }
                }}
                className="whitespace-nowrap text-[10px] text-[#e1e0cc]/78 transition-colors hover:text-[#e1e0cc] sm:text-xs md:text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/42 px-3 py-2 text-xs text-[#e1e0cc] backdrop-blur-xl sm:text-sm">
              <User className="h-4 w-4 text-[#ffcf75]" />
              <span className="hidden max-w-[180px] truncate sm:block">
                {currentUser.username || currentUser.email}
              </span>
              <button
                onClick={onLogout}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/18"
                aria-label="退出"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/48 px-4 py-2 text-sm font-medium text-[#e1e0cc] backdrop-blur-xl transition-colors hover:bg-black/64"
            >
              <User className="h-4 w-4" />
              登录
            </button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-12 items-end gap-4">
            <div className="col-span-12 lg:col-span-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/38 px-3 py-1.5 text-xs text-[#e1e0cc]/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#ffcf75]" />
                电影素材生成工作台
              </div>

              <h1
                className="font-medium leading-[0.85] tracking-normal text-[19vw] sm:text-[17vw] md:text-[15vw] lg:text-[11vw] xl:text-[10vw]"
                style={{ color: '#E1E0CC' }}
              >
                <WordsPullUp text="Peripheral" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 pb-3 lg:col-span-4 lg:pb-10">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl text-sm text-[#e1e0cc]/78 sm:text-base"
                style={{ lineHeight: 1.45 }}
              >
                上传剧照、海报或角色素材，生成适合聊天传播的表情包，以及商家沟通用的三视图建模参考。
              </motion.p>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  onClick={onCreateEmoticon}
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-[#E1E0CC] py-1 pl-5 pr-1 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
                >
                  创建表情包
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
                  </span>
                </motion.button>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onClick={onCreateModel}
                  className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[#E1E0CC]/24 bg-black/36 px-5 text-sm font-medium text-[#E1E0CC] backdrop-blur-xl transition-colors hover:bg-black/52 sm:text-base"
                >
                  <Play className="h-4 w-4 fill-current" />
                  生成建模图
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[#e1e0cc]">
                <div className="rounded-xl border border-white/10 bg-black/36 p-3 backdrop-blur-xl">
                  <MessageCircle className="mb-3 h-4 w-4 text-[#ffcf75]" />
                  <div className="text-sm font-semibold">3-5 个版本</div>
                  <div className="mt-1 text-xs text-[#e1e0cc]/58">表情包输出</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/36 p-3 backdrop-blur-xl">
                  <Box className="mb-3 h-4 w-4 text-[#ffcf75]" />
                  <div className="text-sm font-semibold">正侧背</div>
                  <div className="mt-1 text-xs text-[#e1e0cc]/58">建模参考</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
