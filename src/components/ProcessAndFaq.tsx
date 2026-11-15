import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { FIVERR_GIG_URL } from '../lib/assets';

const DELIVERABLES = [
  {
    step: '01',
    title: 'Custom Die-Line & Bleed',
    detail:
      'Every pouch is laid out on exact manufacturer templates with 3mm bleed, safe zones, zipper tracks, and tear-notch alignment.',
  },
  {
    step: '02',
    title: 'Foil & Spot UV Plates',
    detail:
      'Dedicated vector spot-color layers for holographic accents, metallic stamping, matte soft-touch varnish, and clear windows.',
  },
  {
    step: '03',
    title: '3D Studio Mockups',
    detail:
      'Photorealistic front and angled stand-up pouch renders ready for e-commerce storefronts, pitch decks, and social launches.',
  },
  {
    step: '04',
    title: 'Editable Source Files',
    detail:
      'Full layered Adobe Illustrator (.AI) or Photoshop (.PSD) files plus press-ready CMYK PDFs with 100% commercial rights.',
  },
];

const FAQS = [
  {
    question: 'What files do I receive when ordering on Fiverr?',
    answer:
      'You receive print-ready CMYK PDFs with bleed and die-line guides, separated metallic foil / Spot UV vector layers, editable source files (.AI or .PSD), and high-resolution 3D studio mockups.',
  },
  {
    question: 'Can you design custom die-cut shapes or 3.5g pouches?',
    answer:
      'Yes. We design standard 3.5g stand-up pouches, gusseted coffee/snack bags, child-resistant exit pouches, and completely custom contour die-cut Mylar shapes.',
  },
  {
    question: 'How fast is the turnaround time?',
    answer:
      'Initial packaging concepts are typically delivered within 24 to 48 hours on Fiverr, followed by rapid revisions until your artwork is approved for press.',
  },
  {
    question: 'Do I need my manufacturer template before ordering?',
    answer:
      'If you already have a printer template, send it over when placing your Fiverr order. Otherwise, tell us your target bag dimensions and we will build an industry-standard die-line.',
  },
];

export function ProcessAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section id="finishes" className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#52525B]">
              Print Specifications &amp; Deliverables
            </p>
            <h2
              className="mt-2 font-display text-3xl font-bold tracking-tight text-[#111113] sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Built for press accuracy, not just flat concepts.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-black/[0.08] bg-[#F7F7F5] p-6"
              >
                <p className="font-mono text-xs font-medium text-[#066E45] tabular-nums">
                  {item.step}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-[#111113]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B4B52]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="border-t border-black/[0.08] bg-[#F7F7F5]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-8 rounded-2xl bg-[#111113] p-8 text-white sm:p-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-medium tracking-wide text-white/70">
                Direct Fiverr Ordering
              </p>
              <h2
                className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                Ready to launch your next Mylar packaging line?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                Pick a visual direction from our archive or share your brand brief directly on
                Fiverr for a custom stand-up pouch, die-cut bag, or full strain series.
              </p>
            </div>
            <div className="flex lg:col-span-4 lg:justify-end">
              <a
                href={FIVERR_GIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0B8A57] px-6 py-3.5 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:bg-[#097549] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Custom Order Now Fiverr</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium tracking-wide text-[#52525B]">Common Questions</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#111113]">
                Production &amp; order FAQ
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4B4B52]">
                Everything needed before sending your Mylar artwork to print.
              </p>
            </div>

            <div className="divide-y divide-black/[0.08] border-y border-black/[0.08] lg:col-span-8">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066E45]"
                    >
                      <span className="font-display text-base font-semibold text-[#111113]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#52525B] transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <p className="pb-5 text-sm leading-relaxed text-[#4B4B52]">{faq.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
