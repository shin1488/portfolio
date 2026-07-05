import { useEffect, useRef, useState } from 'react';
import { highResSrc } from '@/lib/image';

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const MAX_SCALE = 5;

/**
 * 이미지 확대 보기 오버레이.
 * 닫기: ESC · 바깥(백드롭) 클릭 · 우상단 X.
 * 확대: 이미지/돋보기 버튼 클릭 · 휠 · (확대 상태에서) 드래그로 이동.
 */
export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  const zoomed = scale > 1;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const clamp = (value: number) => Math.min(MAX_SCALE, Math.max(1, value));

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    setScale((current) => {
      const next = clamp(current - event.deltaY * 0.0015 * current);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // 이미지 클릭: 원본 크기면 확대만(1→2), 이미 확대 상태면 클릭으로 리셋하지 않는다(드래그 이동 방해 방지).
  const handleImageClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!zoomed) setScale(2);
  };

  const toggleZoom = () => (zoomed ? reset() : setScale(2.5));

  const onPointerDown = (event: React.PointerEvent) => {
    if (!zoomed) return;
    event.stopPropagation();
    drag.current = { x: event.clientX, y: event.clientY, tx: offset.x, ty: offset.y };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset({
      x: drag.current.tx + (event.clientX - drag.current.x),
      y: drag.current.ty + (event.clientY - drag.current.y),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const buttonClass =
    'flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || '이미지 확대 보기'}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/85 p-4 backdrop-blur-sm sm:p-10"
    >
      <div className="fixed right-4 top-4 z-10 flex gap-2" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label={zoomed ? '원래 크기로' : '확대'} onClick={toggleZoom} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            <path d={zoomed ? 'M8 11h6' : 'M11 8v6M8 11h6'} strokeLinecap="round" />
          </svg>
        </button>
        <button ref={closeRef} type="button" aria-label="닫기" onClick={onClose} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <img
        src={highResSrc(src)}
        alt={alt}
        draggable={false}
        onClick={handleImageClick}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 0.15s ease-out',
          cursor: !zoomed ? 'zoom-in' : dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl select-none"
      />
    </div>
  );
}
