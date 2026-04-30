import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Peripheral Studio | 电影周边与表情包生成',
    template: '%s | Peripheral Studio',
  },
  description:
    '基于电影素材生成表情包与周边建模参考图，帮助内容创作者和商家快速完成视觉产物。',
  keywords: [
    '电影周边',
    '表情包生成',
    '建模图生成',
    '三视图',
    'AI 图片生成',
  ],
  authors: [{ name: 'Peripheral Studio' }],
  generator: 'Peripheral Studio',
  // icons: {
  //   icon: '',
  // },
  openGraph: {
    title: 'Peripheral Studio | 电影周边与表情包生成',
    description:
      '上传剧照、海报或角色素材，快速生成表情包与商家可用的建模参考图。',
    url: 'https://peripheral-cyan.vercel.app',
    siteName: 'Peripheral Studio',
    locale: 'zh_CN',
    type: 'website',
    // images: [
    //   {
    //     url: '',
    //     width: 1200,
    //     height: 630,
    //     alt: '扣子编程 - 你的 AI 工程师',
    //   },
    // ],
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Coze Code | Your AI Engineer is Here',
  //   description:
  //     'Build and deploy full-stack applications through AI conversation. No env setup, just flow.',
  //   // images: [''],
  // },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
          <div className="pointer-events-auto rounded-full border border-white/12 bg-[#111014]/82 px-4 py-2 text-xs text-white/82 shadow-lg backdrop-blur-xl">
            反馈：
            <a
              href="mailto:feedback@peripheral-cyan.vercel.app"
              className="ml-1 text-[#ffcf75] hover:text-white"
            >
              feedback@peripheral-cyan.vercel.app
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
