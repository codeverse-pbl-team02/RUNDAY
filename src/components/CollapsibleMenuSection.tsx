import { useId, useState, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function CollapsibleMenuSection({ title, children }: Props) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section>
      <h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((previous) => !previous)}
          className="w-full min-h-11 flex items-center justify-between gap-2 px-1 mb-1 text-left text-[10px] font-bold text-[#94afc8] uppercase tracking-wider rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0570db]"
        >
          <span>{title}</span>
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h2>
      <div id={contentId} hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}
