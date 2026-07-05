import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import type { SectionId } from '@/lib/nav';

interface SectionProps {
  id: SectionId;
  title: string;
  children: ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        <Reveal>
          <h2
            id={headingId}
            className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {title}
          </h2>
        </Reveal>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
