'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play, RotateCcw } from 'lucide-react';

const defaultCardImages = [
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
];

const ASCII_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/"\'`~?';

function generateCode(width: number, height: number) {
  let text = '';

  for (let index = 0; index < width * height; index += 1) {
    text += ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
  }

  let output = '';

  for (let row = 0; row < height; row += 1) {
    output += `${text.substring(row * width, (row + 1) * width)}\n`;
  }

  return output;
}

type ScannerCardStreamProps = {
  showControls?: boolean;
  showSpeed?: boolean;
  initialSpeed?: number;
  direction?: -1 | 1;
  cardImages?: string[];
  repeat?: number;
  cardGap?: number;
  friction?: number;
  scanEffect?: 'clip' | 'scramble';
  className?: string;
  height?: number;
};

type CardData = {
  id: number;
  image: string;
  ascii: string;
};

export function ScannerCardStream({
  showControls = false,
  showSpeed = false,
  initialSpeed = 150,
  direction = -1,
  cardImages = defaultCardImages,
  repeat = 5,
  cardGap = 36,
  friction = 0.985,
  scanEffect = 'scramble',
  className,
  height = 280,
}: ScannerCardStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalAscii = useRef(new Map<number, string>());
  const scrambleTimers = useRef(new Map<number, number>());
  const streamStateRef = useRef({
    position: 0,
    velocity: initialSpeed,
    direction,
    isDragging: false,
    lastPointerX: 0,
    lastTime: 0,
    cardWidth: 320,
    minVelocity: 40,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [isScanning, setIsScanning] = useState(false);
  const imageKey = (cardImages.length > 0 ? cardImages : defaultCardImages).join('|');

  const cards = useMemo<CardData[]>(() => {
    const safeImages = cardImages.length > 0 ? cardImages : defaultCardImages;
    const totalCards = safeImages.length * repeat;

    return Array.from({ length: totalCards }, (_, index) => ({
      id: index,
      image: safeImages[index % safeImages.length],
      ascii: generateCode(58, 18),
    }));
  }, [imageKey, repeat]);

  useEffect(() => {
    const container = containerRef.current;
    const cardLine = cardLineRef.current;
    const particleCanvas = particleCanvasRef.current;
    const scannerCanvas = scannerCanvasRef.current;

    if (!container || !cardLine || !particleCanvas || !scannerCanvas) {
      return undefined;
    }

    originalAscii.current.clear();
    cards.forEach((card) => originalAscii.current.set(card.id, card.ascii));

    const streamState = streamStateRef.current;
    streamState.position = 0;
    streamState.velocity = initialSpeed;
    streamState.direction = direction;
    streamState.isDragging = false;
    streamState.lastPointerX = 0;
    streamState.lastTime = performance.now();
    streamState.cardWidth = 320;
    streamState.minVelocity = 40;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: particleCanvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 320;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount);

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 100;
    textureCanvas.height = 100;
    const textureContext = textureCanvas.getContext('2d');

    if (!textureContext) {
      return undefined;
    }

    const center = textureCanvas.width / 2;
    const gradient = textureContext.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0.02, '#ffffff');
    gradient.addColorStop(0.12, '#c4b5fd');
    gradient.addColorStop(0.3, '#312e81');
    gradient.addColorStop(1, 'transparent');
    textureContext.fillStyle = gradient;
    textureContext.beginPath();
    textureContext.arc(center, center, center, 0, Math.PI * 2);
    textureContext.fill();

    const texture = new THREE.CanvasTexture(textureCanvas);

    const scannerContext = scannerCanvas.getContext('2d');
    if (!scannerContext) {
      renderer.dispose();
      texture.dispose();
      return undefined;
    }

    const scannerParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      life: number;
      decay: number;
    }> = [];

    const createScannerParticle = (width: number) => ({
      x: width / 2 + (Math.random() - 0.5) * 8,
      y: Math.random() * height,
      vx: Math.random() * 1.2 + 0.2,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 0.9 + 0.3,
      alpha: Math.random() * 0.45 + 0.35,
      life: 1,
      decay: Math.random() * 0.018 + 0.004,
    });

    const updateSize = () => {
      const { width } = container.getBoundingClientRect();
      streamState.cardWidth = 320;
      streamState.position = width;
      particleCanvas.width = width;
      particleCanvas.height = height;
      scannerCanvas.width = width;
      scannerCanvas.height = height;
      renderer.setSize(width, height, false);

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      for (let index = 0; index < particleCount; index += 1) {
        positions[index * 3] = (Math.random() - 0.5) * width * 1.8;
        positions[index * 3 + 1] = (Math.random() - 0.5) * height;
        positions[index * 3 + 2] = 0;
        alphas[index] = Math.random() * 0.5 + 0.2;
        velocities[index] = Math.random() * 35 + 18;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

      scannerParticles.length = 0;
      for (let index = 0; index < 520; index += 1) {
        scannerParticles.push(createScannerParticle(width));
      }
    };

    updateSize();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: texture },
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 14.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const runScrambleEffect = (element: HTMLElement, cardId: number) => {
      if (scrambleTimers.current.has(cardId)) {
        return;
      }

      let iterations = 0;
      const originalText = originalAscii.current.get(cardId) ?? '';
      const timer = window.setInterval(() => {
        element.textContent = generateCode(58, 18);
        iterations += 1;

        if (iterations >= 7) {
          window.clearInterval(timer);
          scrambleTimers.current.delete(cardId);
          element.textContent = originalText;
        }
      }, 34);

      scrambleTimers.current.set(cardId, timer);
    };

    const updateCardEffects = () => {
      const scannerX = scannerCanvas.width / 2;
      const scannerWidth = 12;
      const scannerLeft = scannerX - scannerWidth / 2;
      const scannerRight = scannerX + scannerWidth / 2;
      let anyCardScanning = false;

      cardLine.querySelectorAll<HTMLElement>('.card-wrapper').forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const cardId = Number(wrapper.dataset.cardId);
        const normalCard = wrapper.querySelector<HTMLElement>('.card-normal');
        const asciiCard = wrapper.querySelector<HTMLElement>('.card-ascii');
        const asciiContent = wrapper.querySelector<HTMLElement>('pre');

        if (!normalCard || !asciiCard || !asciiContent) {
          return;
        }

        if (rect.left < scannerRight && rect.right > scannerLeft) {
          anyCardScanning = true;

          if (scanEffect === 'scramble' && wrapper.dataset.scanned !== 'true') {
            runScrambleEffect(asciiContent, cardId);
          }

          wrapper.dataset.scanned = 'true';
          const intersectLeft = Math.max(scannerLeft - rect.left, 0);
          const intersectRight = Math.min(scannerRight - rect.left, rect.width);

          normalCard.style.setProperty('--clip-right', `${(intersectLeft / rect.width) * 100}%`);
          asciiCard.style.setProperty('--clip-left', `${(intersectRight / rect.width) * 100}%`);
        } else {
          delete wrapper.dataset.scanned;

          if (rect.right < scannerLeft) {
            normalCard.style.setProperty('--clip-right', '100%');
            asciiCard.style.setProperty('--clip-left', '100%');
          } else {
            normalCard.style.setProperty('--clip-right', '0%');
            asciiCard.style.setProperty('--clip-left', '0%');
          }
        }
      });

      setIsScanning(anyCardScanning);
    };

    const pointerX = (event: MouseEvent | TouchEvent) =>
      'touches' in event ? event.touches[0]?.clientX ?? streamState.lastPointerX : event.clientX;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      streamState.isDragging = true;
      streamState.lastPointerX = pointerX(event);
      container.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (!streamState.isDragging) {
        return;
      }

      const currentX = pointerX(event);
      const deltaX = currentX - streamState.lastPointerX;
      streamState.position += deltaX;
      streamState.velocity = Math.max(Math.abs(deltaX) * 22, streamState.minVelocity);
      streamState.direction = deltaX >= 0 ? 1 : -1;
      streamState.lastPointerX = currentX;
    };

    const handlePointerUp = () => {
      streamState.isDragging = false;
      container.style.cursor = 'grab';
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY + event.deltaX;
      streamState.position -= delta * 0.55;
      streamState.velocity = Math.max(Math.abs(delta) * 1.4, streamState.minVelocity);
      streamState.direction = delta > 0 ? -1 : 1;
    };

    cardLine.addEventListener('mousedown', handlePointerDown);
    cardLine.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    cardLine.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateSize);

    let animationFrameId = 0;

    const animate = (time: number) => {
      const deltaTime = Math.max((time - streamState.lastTime) / 1000, 0.016);
      streamState.lastTime = time;

      if (!isPaused && !streamState.isDragging) {
        if (streamState.velocity > streamState.minVelocity) {
          streamState.velocity *= friction;
        }

        streamState.position += streamState.velocity * streamState.direction * deltaTime;
        setSpeed(Math.round(streamState.velocity));
      }

      const trackWidth = (streamState.cardWidth + cardGap) * cards.length;
      const containerWidth = container.offsetWidth;

      if (streamState.position < -trackWidth) {
        streamState.position = containerWidth;
      } else if (streamState.position > containerWidth) {
        streamState.position = -trackWidth;
      }

      cardLine.style.transform = `translateX(${streamState.position}px)`;
      updateCardEffects();

      for (let index = 0; index < particleCount; index += 1) {
        positions[index * 3] += velocities[index] * 0.016;
        if (positions[index * 3] > particleCanvas.width / 2 + 80) {
          positions[index * 3] = -particleCanvas.width / 2 - 80;
        }
        positions[index * 3 + 1] += Math.sin(time * 0.001 + index * 0.15) * 0.28;
        alphas[index] = Math.max(0.1, Math.min(0.9, alphas[index] + (Math.random() - 0.5) * 0.03));
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.alpha.needsUpdate = true;
      renderer.render(scene, camera);

      scannerContext.clearRect(0, 0, scannerCanvas.width, scannerCanvas.height);
      scannerParticles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;

        if (particle.life <= 0 || particle.x > scannerCanvas.width + 24) {
          Object.assign(particle, createScannerParticle(scannerCanvas.width));
        }

        scannerContext.globalAlpha = particle.alpha * particle.life;
        scannerContext.fillStyle = '#f5f3ff';
        scannerContext.beginPath();
        scannerContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        scannerContext.fill();
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      cardLine.removeEventListener('mousedown', handlePointerDown);
      cardLine.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      cardLine.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateSize);
      scrambleTimers.current.forEach((timer) => window.clearInterval(timer));
      scrambleTimers.current.clear();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [cards, cardGap, direction, friction, height, initialSpeed, isPaused, scanEffect]);

  const resetPosition = () => {
    const container = containerRef.current;
    const cardLine = cardLineRef.current;

    if (!container || !cardLine) {
      return;
    }

    streamStateRef.current.position = container.offsetWidth;
    streamStateRef.current.velocity = initialSpeed;
    streamStateRef.current.direction = direction;
    cardLine.style.transform = `translateX(${container.offsetWidth}px)`;
    setIsPaused(false);
    setSpeed(initialSpeed);
  };

  return (
    <div
      ref={containerRef}
      className={[
        'relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_28%),linear-gradient(180deg,rgba(9,9,11,0.96),rgba(24,24,27,0.88))] shadow-[0_28px_80px_rgba(0,0,0,0.38)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
    >
      <style jsx global>{`
        @keyframes scanner-glitch {
          0%, 100% { opacity: 1; }
          14% { opacity: 0.92; }
          48% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        @keyframes scanner-pulse {
          0% { opacity: 0.72; transform: scaleY(1); }
          100% { opacity: 1; transform: scaleY(1.04); }
        }

        .animate-scanner-glitch {
          animation: scanner-glitch 0.14s infinite linear alternate-reverse;
        }

        .animate-scanner-pulse {
          animation: scanner-pulse 1.4s infinite alternate ease-in-out;
        }
      `}</style>

      {showControls && (
        <div className="absolute left-4 top-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 backdrop-blur-md transition-colors hover:bg-white/14"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={resetPosition}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 backdrop-blur-md transition-colors hover:bg-white/14"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {showSpeed && (
        <div className="absolute right-4 top-4 z-30 rounded-full border border-white/12 bg-black/35 px-3 py-1 text-xs font-medium tracking-[0.18em] text-white/72 backdrop-blur-md">
          {speed} PX/S
        </div>
      )}

      <canvas
        ref={particleCanvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
      <canvas
        ref={scannerCanvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 z-20 h-[82%] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-transparent via-violet-300 to-transparent shadow-[0_0_12px_rgba(196,181,253,0.85),0_0_34px_rgba(139,92,246,0.55),0_0_60px_rgba(79,70,229,0.45)] transition-opacity duration-300 animate-scanner-pulse ${
          isScanning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="absolute inset-x-0 top-5 z-20 flex justify-center">
        <div className="rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-white/62 backdrop-blur-md">
          Generating Frames
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
        <div
          ref={cardLineRef}
          className="flex cursor-grab select-none items-center whitespace-nowrap will-change-transform"
          style={{ gap: `${cardGap}px` }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              data-card-id={card.id}
              className="card-wrapper relative h-[72%] w-[320px] shrink-0 sm:w-[360px]"
            >
              <div className="card-normal absolute inset-0 z-[2] overflow-hidden rounded-[22px] border border-white/10 bg-black/20 shadow-[0_18px_48px_rgba(0,0,0,0.45)] [clip-path:inset(0_0_0_var(--clip-right,0%))]">
                <img
                  src={card.image}
                  alt="Loading card"
                  className="h-full w-full rounded-[22px] object-cover brightness-110 contrast-110 saturate-110 transition-transform duration-500"
                />
              </div>
              <div className="card-ascii absolute inset-0 z-[1] overflow-hidden rounded-[22px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(18,18,23,0.92),rgba(9,9,11,0.94))] [clip-path:inset(0_calc(100%-var(--clip-left,0%))_0_0)]">
                <pre className="animate-scanner-glitch m-0 h-full w-full overflow-hidden whitespace-pre p-4 text-left font-mono text-[10px] leading-[12px] tracking-[0.04em] text-[rgba(220,210,255,0.62)] [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,0.88)_35%,rgba(0,0,0,0.62)_70%,rgba(0,0,0,0.24)_100%)]">
                  {card.ascii}
                </pre>
              </div>
              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[3] rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Scan Layer</div>
                <div className="mt-1 text-sm font-medium text-white/86">素材解析与变体生成中</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
