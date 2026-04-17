import { ScannerCardStream } from '@/components/ui/scanner-card-stream';

export default function ScannerCardStreamDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScannerCardStream showControls showSpeed height={360} />
      </div>
    </div>
  );
}
