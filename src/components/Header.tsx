import { ArrowUpRight, User } from 'lucide-react';
import { FIVERR_GIG_URL } from '../lib/assets';
import { UserSession } from '../types';

interface HeaderProps {
  user: UserSession | null;
  onOpenAccount: () => void;
}

export function Header({ user, onOpenAccount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.08] bg-[#F7F7F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-8 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="font-display text-base font-bold tracking-tight text-[#111113] whitespace-nowrap shrink-0 sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#066E45]"
        >
          DilanMax
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B4B52]"
        >
          <a
            href="#designs"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#111113] hover:underline underline-offset-4"
          >
            Designs
          </a>
          <a
            href="#finishes"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#111113] hover:underline underline-offset-4"
          >
            Finishes
          </a>
          <a
            href="#process"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#111113] hover:underline underline-offset-4"
          >
            Process
          </a>
          <a
            href="#faq"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#111113] hover:underline underline-offset-4"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 shrink-0 sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenAccount}
            className="inline-flex min-h-[38px] sm:min-h-[40px] items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-[#111113] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#EFEFED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111113]"
          >
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="max-w-[84px] truncate">
              {user ? user.name : 'Login'}
            </span>
          </button>

          <a
            href={FIVERR_GIG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] sm:min-h-[40px] items-center gap-1 rounded-lg bg-[#066E45] px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#055837] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066E45]"
          >
            <span className="sm:hidden">Order</span>
            <span className="hidden sm:inline">Order on Fiverr</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
