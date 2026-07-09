import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkGfm from 'remark-gfm';
import { imageDimensions } from 'virtual:image-dimensions';
import { buildSrcSet } from '@/lib/image';
import { FlickerSpinner } from './FlickerSpinner';
import { Lightbox } from './Lightbox';

interface MarkdownProps {
  children: string;
}

/** YouTube URL(watch·youtu.be·shorts·embed)에서 11자 영상 ID를 뽑는다. */
function getYouTubeId(href: string | undefined): string | null {
  if (!href) return null;
  const m = href.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
}

/**
 * 시연 영상 — PDF 뷰어와 같은 모양(상단 제목 헤더 + aspect-video 본문, 같은 테두리).
 * 썸네일 파사드를 먼저 보여주고, 클릭 시에만 iframe을 로드한다(초기 로딩 성능).
 */
function YouTubeEmbed({ id, title }: { id: string; title?: string }) {
  const [playing, setPlaying] = useState(false);
  const label = title?.trim() || '영상';
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3.5 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span className="truncate">{label}</span>
        <a
          href={`https://youtu.be/${id}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 no-underline hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          YouTube ↗
        </a>
      </div>
      <div className="relative aspect-video w-full bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={label}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`영상 재생: ${label}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7 fill-white" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** /files/ 로 서빙되는 로컬 PDF 링크면 그 경로를, 아니면 null. */
function getFilePdf(href: string | undefined): string | null {
  if (!href) return null;
  return /^\/files\/[^?#]+\.pdf(?:[?#].*)?$/i.test(href) ? href : null;
}

/** hast 노드의 텍스트만 이어붙인다(링크 캡션 추출용). */
function hastText(node: unknown): string {
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (!n) return '';
  if (n.type === 'text') return n.value ?? '';
  if (Array.isArray(n.children)) return n.children.map(hastText).join('');
  return '';
}

// PDF.js 뷰어는 무거우므로(청크 + pdf.js 워커) 클릭 시에만 별도 청크로 불러온다.
const PdfViewer = lazy(() => import('./PdfViewer'));

/**
 * 발표자료(PDF) 인라인 임베드. 무거운 PDF.js를 초기에 받지 않도록, 뷰가 가까워지면
 * (IntersectionObserver) 그때 뷰어를 lazy 로드해 첫 슬라이드를 미리보기로 띄운다
 * (클릭하면 좌·우 이동·전체화면이 붙는 인터랙티브 모드로 전환).
 */
function PdfEmbed({ href, title }: { href: string; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const label = title?.trim() || '발표 자료';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' }, // 화면에 들어오기 조금 전에 미리 로드
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="my-6">
      {inView ? (
        <Suspense fallback={<PdfSkeleton label={label} />}>
          <PdfViewer href={href} title={label} />
        </Suspense>
      ) : (
        <PdfSkeleton label={label} />
      )}
    </div>
  );
}

/** 첫 슬라이드가 뜨기 전 자리표시(레이아웃 예약 + 로딩 표시). */
function PdfSkeleton({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-linear-to-b from-zinc-800 to-zinc-950 dark:border-zinc-800">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/80 shadow-lg">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-none stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M12 16v4M8 20h8" />
        </svg>
      </span>
      <span className="text-sm font-semibold text-zinc-100">{label}</span>
    </div>
  );
}

/**
 * 본문 이미지 — 지연 로딩 + 클릭 시 확대. 로드 전에는 aspect-ratio로 예약된 자리에
 * 플리커 스피너를 겹쳐 로딩 중임을 보여준다(로드 완료 시 제거).
 */
function MdImage({
  src,
  label,
  onZoom,
  ...props
}: {
  src?: string;
  label: string;
  onZoom: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  // 실측 비율을 aspect-ratio로 박아 로드 전에도 공간만 예약한다(레이아웃 시프트 방지).
  // 이미지 자체엔 어떤 크기 제한도 걸지 않는다 — 원본 비율 그대로 렌더.
  // maxWidth=원본폭은 원본보다 크게 확대(업스케일)만 막을 뿐 비율은 안 건드린다.
  const dims = src ? imageDimensions[src] : undefined;
  const imgStyle = dims
    ? { aspectRatio: `${dims[0]} / ${dims[1]}`, maxWidth: `${dims[0]}px` }
    : undefined;

  return (
    // 스피너를 이미지 자리 위에 겹치기 위한 기준 컨테이너(p 안이라 span, 렌더는 block)
    <span className="relative block">
      <img
        src={src}
        srcSet={src ? buildSrcSet(src) : undefined}
        sizes="(min-width: 768px) 768px, 100vw"
        width={dims?.[0]}
        height={dims?.[1]}
        style={imgStyle}
        loading="lazy"
        decoding="async"
        alt={label}
        role="button"
        tabIndex={0}
        aria-label={label ? `${label} — 확대해서 보기` : '이미지 확대해서 보기'}
        onClick={onZoom}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onZoom();
          }
        }}
        // 캐시된 이미지는 onLoad가 안 뜰 수 있어 마운트 시 complete로 보정한다
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className="cursor-zoom-in transition-opacity hover:opacity-90"
        {...props}
      />
      {!loaded && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-zinc-500">
          <FlickerSpinner />
        </span>
      )}
    </span>
  );
}

/** markdown 본문 렌더러 — 외부 링크는 새 탭, 이미지는 지연 로딩 + 클릭 시 확대 보기 */
export function Markdown({ children }: MarkdownProps) {
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);

  // 렌더러 정체성 고정 — 인라인 객체로 넘기면 렌더마다 새 함수 타입이 되어 React가 본문
  // 서브트리 전체를 리마운트한다(라이트박스만 여닫아도 이미지·PDF 뷰어가 전부 리셋되고,
  // 그 과정에서 높이가 변해 스크롤이 어긋나던 원인). setZoomed는 정체성이 고정이라 deps 없음.
  const components = useMemo<Components>(
    () => ({
          // 문단이 오직 로컬 PDF 링크 하나로만 이뤄졌으면(발표자료 등) 다운로드 링크 대신
          // 인라인 뷰어로 바꾼다. 문장 속에 섞인 링크(예: 보고서 1차·2차)는 그대로 링크로 둔다.
          p({ node, children, ...props }) {
            const kids = (node?.children ?? []).filter(
              (c) => !(c.type === 'text' && !c.value.trim()),
            );
            const only = kids[0];
            if (kids.length === 1 && only.type === 'element' && only.tagName === 'a') {
              const href = typeof only.properties?.href === 'string' ? only.properties.href : undefined;
              const videoId = getYouTubeId(href);
              if (videoId) {
                return <YouTubeEmbed id={videoId} title={hastText(only)} />;
              }
              const pdf = getFilePdf(href);
              if (pdf) {
                return <PdfEmbed href={pdf} title={hastText(only)} />;
              }
            }
            return <p {...props}>{children}</p>;
          },
          a({ node: _node, href, children: linkChildren, ...props }) {
            const external = /^https?:/i.test(href ?? '');
            return (
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                {...props}
              >
                {linkChildren}
                {external && (
                  <>
                    {/* 네모+대각선 화살표 = 외부(새 탭) 링크 표시. currentColor·0.85em로 글자와 어울림 */}
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-0.5 inline-block size-[0.85em] align-[-0.125em]"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                    </svg>
                    <span className="sr-only"> (새 탭에서 열림)</span>
                  </>
                )}
              </a>
            );
          },
          img({ node: _node, alt, src, ...props }) {
            const label = alt ?? '';
            return (
              <MdImage
                src={typeof src === 'string' ? src : undefined}
                label={label}
                onZoom={() => {
                  if (typeof src === 'string') setZoomed({ src, alt: label });
                }}
                {...props}
              />
            );
          },
    }),
    [],
  );

  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-img:rounded-xl prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCjkFriendly]}
        rehypePlugins={[
          // 헤딩에 id를 달아 목차(TOC) 앵커가 동작하게 한다
          rehypeSlug,
          // 챗봇 action 블록 같은 커스텀 언어는 JSON 문법으로 하이라이트
          [rehypeHighlight, { aliases: { json: ['action'] } }],
        ]}
        components={components}
      >
        {children}
      </ReactMarkdown>
      {zoomed && (
        <Lightbox src={zoomed.src} alt={zoomed.alt} onClose={() => setZoomed(null)} />
      )}
    </div>
  );
}
