import { useState } from 'react';
import { ArrowUpRight, Maximize2, Pencil, Trash2, Package, Bookmark } from 'lucide-react';
import { MylarDesign } from '../types';
import { FIVERR_GIG_URL, resolveDesignImageUrl } from '../lib/assets';

interface DesignCardProps {
  design: MylarDesign;
  isOwner: boolean;
  isSaved: boolean;
  onInspect: (design: MylarDesign) => void;
  onToggleSave: (design: MylarDesign) => void;
  onEdit: (design: MylarDesign) => void;
  onDelete: (design: MylarDesign) => void;
}

export function DesignCard({
  design,
  isOwner,
  isSaved,
  onInspect,
  onToggleSave,
  onEdit,
  onDelete,
}: DesignCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = resolveDesignImageUrl(design.imageUrl);
  const orderHref = design.fiverrUrl || FIVERR_GIG_URL;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-white p-3.5 sm:p-4 transition-transform duration-150 hover:-translate-y-0.5">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#EFEFED]">
          {!imgFailed ? (
            <img
              src={resolvedSrc}
              alt={`${design.title} — ${design.finish}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EFEFED] to-[#E3E3DF] p-4 text-center">
              <Package className="h-8 w-8 text-[#52525B]" aria-hidden="true" />
              <span className="text-xs font-medium text-[#4B4B52]">{design.title}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onInspect(design)}
            aria-label={`Inspect ${design.title}`}
            className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#066E45]"
          />

          {!isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(design);
              }}
              aria-label={isSaved ? `Remove ${design.title} from saved` : `Save ${design.title}`}
              className={`absolute right-2.5 top-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-colors ${
                isSaved
                  ? 'bg-[#066E45] text-white'
                  : 'bg-white/90 text-[#111113] hover:bg-white'
              }`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isSaved ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
          )}

          <button
            type="button"
            onClick={() => onInspect(design)}
            aria-label={`Zoom ${design.title}`}
            className="pointer-events-none absolute bottom-3 right-3 hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-[#111113] opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>

          {isOwner && (
            <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(design);
                }}
                aria-label={`Edit ${design.title}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#111113] shadow-sm transition-colors hover:bg-[#111113] hover:text-white"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(design);
                }}
                aria-label={`Delete ${design.title}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#B91C1C] shadow-sm transition-colors hover:bg-[#B91C1C] hover:text-white"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-3.5 sm:mt-4">
          <div className="flex items-center gap-1.5 text-xs text-[#52525B]">
            <span className="truncate">{design.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{design.finish}</span>
          </div>

          <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-[#111113] sm:text-lg">
            <button
              type="button"
              onClick={() => onInspect(design)}
              className="text-left hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066E45]"
            >
              {design.title}
            </button>
          </h3>

          <p className="mt-1 font-mono text-xs text-[#52525B] tabular-nums">{design.dimensions}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-black/[0.06] sm:mt-5">
        <a
          href={orderHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#066E45] px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:bg-[#055837] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066E45]"
        >
          <span>Custom Order Now Fiverr</span>
          <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
