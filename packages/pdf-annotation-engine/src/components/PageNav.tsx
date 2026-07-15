import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PageNavProps {
  currentPage: number;
  numPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PageNav({ currentPage, numPages, onPrev, onNext }: PageNavProps) {
  return (
    <div className="flex items-center justify-center gap-4 border-t border-zinc-800 bg-zinc-900 px-3 py-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label="Previous slide"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeftIcon />
      </button>
      <span className="min-w-20 text-center text-sm tabular-nums text-zinc-300">
        {currentPage} / {numPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage >= numPages}
        aria-label="Next slide"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
