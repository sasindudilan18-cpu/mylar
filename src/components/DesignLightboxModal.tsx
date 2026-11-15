import { useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { MylarDesign } from '../types';
import { FIVERR_GIG_URL, resolveDesignImageUrl } from '../lib/assets';

interface DesignLightboxModalProps {
  design: MylarDesign | null;
  onClose: () => void;
}

export function DesignLightboxModal({ design, onClose }: DesignLightboxModalProps) {
  useEffect(() => {
    if (!design) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [design, onClose]);

  if (!design) return null;

  const resolvedSrc = resolveDesignImageUrl(design.imageUrl);
  const orderHref = design.fiverrUrl || FIVERR_GIG_URL;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[92dvh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-[#111113] shadow-sm transition-colors hover:bg-[#111113] hover:text-white focus-visible:outline-2 focus-visible:outline-[#066E45] sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="bg-[#EFEFED] md:col-span-7">
          <img
            src={resolvedSrc}
            alt={design.title}
            referrerPolicy="no-referrer"
            className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full md:max-h-[520px]"
          />
        </div>

        <div className="flex flex-col justify-between p-5 sm:p-8 md:col-span-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#52525B]">
              <span>{design.category}</span>
              <span aria-hidden="true">·</span>
              <span>{design.finish}</span>
            </div>

            <h2 id="lightbox-title" className="mt-2 font-display text-xl font-bold text-[#111113] sm:text-2xl">
              {design.title}
            </h2>

            <p className="mt-1.5 font-mono text-xs text-[#52525B] tabular-nums">
              {design.dimensions}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-[#4B4B52]">{design.description}</p>

            <div className="mt-5 space-y-2 border-t border-black/[0.08] pt-4 text-xs text-[#4B4B52]">
              <p>Included with custom order:</p>
              <ul className="space-y-1.5 text-[#111113]">
                <li>• Print-ready CMYK PDF + Adobe Illustrator / PSD source</li>
                <li>• Separate Spot UV &amp; metallic foil vector layers</li>
                <li>• High-resolution 3D studio bag render</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#066E45] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#055837] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066E45]"
            >
              <span>Custom Order Now Fiverr</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
