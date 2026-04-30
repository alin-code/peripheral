import { ScannerCardStream } from '@/components/ui/scanner-card-stream';

export default function ScannerCardStreamDemoPage() {
  return (
    <div className="design-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/52">Preview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">生成中动效</h1>
        </div>
        <ScannerCardStream showControls showSpeed height={360} />
      </div>
    </div>
  );
}
