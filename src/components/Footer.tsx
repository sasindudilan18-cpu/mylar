import { ArrowUpRight } from 'lucide-react';
import { FIVERR_GIG_URL } from '../lib/assets';
import { UserSession } from '../types';

interface FooterProps {
  user: UserSession | null;
  onOpenAccount: () => void;
}

export function Footer({ user, onOpenAccount }: FooterProps) {
  return (
    <footer className="border-t border-black/[0.08] bg-[#F7F7F5]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-base font-bold text-[#111113]">DilanMax Packaging</p>
            <p className="mt-1 text-xs text-[#52525B]">
              Custom Mylar pouches, die-cut bags, and print-ready packaging artwork.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#4B4B52]">
            <a href="#designs" className="inline-flex min-h-[36px] items-center hover:text-[#111113] transition-colors">
              Designs
            </a>
            <a href="#finishes" className="inline-flex min-h-[36px] items-center hover:text-[#111113] transition-colors">
              Finishes
            </a>
            <a href="#faq" className="inline-flex min-h-[36px] items-center hover:text-[#111113] transition-colors">
              FAQ
            </a>
            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex min-h-[36px] items-center hover:text-[#111113] transition-colors"
            >
              {user ? 'Account' : 'Login'}
            </button>
            <a
              href={FIVERR_GIG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-[#066E45] hover:underline underline-offset-4"
            >
              <span>Fiverr Gig</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-black/[0.06] pt-6 text-xs text-[#52525B]">
          <p>© 2026 DilanMax Packaging. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
