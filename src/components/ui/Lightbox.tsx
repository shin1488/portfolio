import { useEffect, useRef, useState } from 'react';
import { highResSrc } from '@/lib/image';
import { Skeleton } from './Skeleton';

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
 * 고해상 원본이 뜨기 전에는 중앙에 플리커 스피너를 보여준다.
 */
export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  const zoomed = scale > 1;

  const clamp = (value: number) => Math.min(MAX_SCALE, Math.max(1, value));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // 잠금은 body가 아닌 html(overflowY)에 — html의 overflow-x: clip 때문에 body에 걸면
    // body가 클리핑 컨테이너가 되어 sticky 헤더가 문서 최상단으로 튄다(잠금도 무력화).
    const previousOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const savedScrollY = window.scrollY;

    // 휠 줌 — React onWheel은 passive로 붙어 preventDefault가 무시되므로(스크롤을 못 막음),
    // 네이티브 non-passive 리스너로 다이얼로그 위의 휠을 전부 소비하며 줌으로 변환한다.
    const root = rootRef.current;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setScale((current) => {
        const next = clamp(current - event.deltaY * 0.0015 * current);
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    };
    root?.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', onKey);
      root?.removeEventListener('wheel', onWheel);
      document.documentElement.style.overflowY = previousOverflowY;
      // 닫힌 직후: 열려 있는 동안의 어떤 드리프트도 원위치로 되돌리고,
      // 줌 휠의 트랙패드 잔여 관성이 잠금 풀린 페이지를 밀어내지 않게 잠깐 흡수한다.
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
      const absorb = (event: WheelEvent) => event.preventDefault();
      window.addEventListener('wheel', absorb, { passive: false });
      window.setTimeout(() => window.removeEventListener('wheel', absorb), 300);
    };
  }, [onClose]);

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
      ref={rootRef}
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
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-40 w-64 rounded-xl" />
        </div>
      )}
      <img
        src={highResSrc(src)}
        alt={alt}
        draggable={false}
        // 캐시된 이미지는 onLoad가 안 뜰 수 있어 마운트 시 complete로 보정한다
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        onClick={handleImageClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 0.15s ease-out',
          cursor: !zoomed ? 'zoom-in' : dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          opacity: loaded ? 1 : 0,
        }}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl select-none"
      />
    </div>
  );
}
