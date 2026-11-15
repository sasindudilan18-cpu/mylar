import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { FIVERR_GIG_URL, HERO_SHOWCASE_IMAGE } from '../lib/assets';

interface HeroProps {
  totalDesigns: number;
}

export function Hero({ totalDesigns }: HeroProps) {
  return (
    <section id="top" className="border-b border-black/[0.08] bg-[#F7F7F5]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#52525B]">
                Custom Mylar Packaging · Die-Cut &amp; Foil Print Ready
              </p>
              <h1
                className="mt-3 font-display text-[1.95rem] font-bold leading-[1.12] tracking-tight text-[#111113] sm:mt-4 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Mylar bag designs engineered to stand out on the shelf.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#4B4B52] sm:mt-5 sm:text-base">
                Bespoke 3.5g stand-up pouches, custom die-cut silhouettes, and holographic foil
                artwork delivered with print-ready CMYK layers, spot-UV masks, and realistic 3D
                mockups directly through Fiverr.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
              <a
                href={FIVERR_GIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#066E45] px-6 py-3 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:bg-[#055837] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066E45]"
              >
                <span>Custom Order Now Fiverr</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="#designs"
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-5 py-3 text-sm font-medium text-[#111113] whitespace-nowrap transition-colors duration-150 hover:bg-[#EFEFED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111113]"
              >
                <span>Browse Designs</span>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-[300px] overflow-hidden rounded-2xl bg-[#18181B]">
              <img
                src={HERO_SHOWCASE_IMAGE}
                alt="Three luxury custom printed matte black and holographic foil Mylar stand-up pouches on dark slate"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
              />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2 text-[11px] sm:bottom-4 sm:left-5 sm:right-5 sm:text-xs text-white/90">
                <span className="truncate font-medium">Matte Soft-Touch · Iridescent Foil</span>
                <span className="shrink-0 font-mono tabular-nums text-white/80">300 DPI · CMYK</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/[0.08] pt-6 sm:mt-12 sm:grid-cols-4 sm:gap-6 sm:pt-8">
          <div>
            <p className="font-mono text-xl font-semibold tracking-tight text-[#111113] tabular-nums sm:text-2xl">
              {totalDesigns}+
            </p>
            <p className="mt-0.5 text-xs text-[#52525B]">Curated Mylar Concepts</p>
          </div>
          <div>
            <p className="font-mono text-xl font-semibold tracking-tight text-[#111113] tabular-nums sm:text-2xl">
              24–48h
            </p>
            <p className="mt-0.5 text-xs text-[#52525B]">First Concept Delivery</p>
          </div>
          <div>
            <p className="font-mono text-xl font-semibold tracking-tight text-[#111113] tabular-nums sm:text-2xl">
              AI · PSD · PDF
            </p>
            <p className="mt-0.5 text-xs text-[#52525B]">Print-Ready Source Files</p>
          </div>
          <div>
            <p className="font-mono text-xl font-semibold tracking-tight text-[#111113] tabular-nums sm:text-2xl">
              3D Render
            </p>
            <p className="mt-0.5 text-xs text-[#52525B]">Included Every Fiverr Order</p>
          </div>
        </div>
      </div>
    </section>
  );
}
