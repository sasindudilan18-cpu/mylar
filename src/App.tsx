import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, LogOut } from 'lucide-react';
import { DesignCategory, MylarDesign, UserSession } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DesignCard } from './components/DesignCard';
import { DesignLightboxModal } from './components/DesignLightboxModal';
import { ProcessAndFaq } from './components/ProcessAndFaq';
import { Footer } from './components/Footer';
import { StudioPortalModal } from './components/StudioPortalModal';

const TOKEN_STORAGE_KEY = 'dm_studio_session_v3';

const FILTER_TABS: Array<'All' | DesignCategory> = [
  'All',
  '3.5g Stand-Up',
  'Die-Cut Shape',
  'Holographic Foil',
  'Matte & Spot UV',
];

export default function App() {
  const [designs, setDesigns] = useState<MylarDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | DesignCategory>('All');
  const [inspectedDesign, setInspectedDesign] = useState<MylarDesign | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<UserSession | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<MylarDesign | null>(null);

  const fetchDesigns = useCallback(async () => {
    setLoadError('');
    try {
      const res = await fetch('/api/designs');
      if (!res.ok) throw new Error('Failed to load designs');
      const data = await res.json();
      setDesigns(Array.isArray(data.designs) ? data.designs : []);
    } catch {
      setLoadError('Unable to load Mylar bag designs right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  useEffect(() => {
    if (!authToken) {
      setUser(null);
      return;
    }
    let cancelled = false;
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
          setAuthToken(null);
          try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  const openAccountModal = (designToEdit: MylarDesign | null = null) => {
    setEditingDesign(designToEdit);
    setPortalOpen(true);
  };

  const handleAuthSuccess = (token: string, nextUser: UserSession) => {
    setAuthToken(token);
    setUser(nextUser);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    setEditingDesign(null);
    setPortalOpen(false);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleToggleSave = async (design: MylarDesign) => {
    if (!authToken || !user) {
      openAccountModal(null);
      return;
    }
    try {
      const res = await fetch('/api/user/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ designId: design.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                savedDesignIds: Array.isArray(data.savedDesignIds) ? data.savedDesignIds : [],
              }
            : prev
        );
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteDesign = async (design: MylarDesign) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/designs/${design.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setDesigns((prev) => prev.filter((item) => item.id !== design.id));
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch {
      // ignore
    }
  };

  const filteredDesigns = useMemo(() => {
    if (activeCategory === 'All') return designs;
    return designs.filter((item) => item.category === activeCategory);
  }, [designs, activeCategory]);

  const isOwner = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111113]">
      <Header user={user} onOpenAccount={() => openAccountModal(null)} />

      <main>
        <Hero totalDesigns={Math.max(designs.length, 4)} />

        <section id="designs" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#52525B]">
                Selected Packaging Portfolio
              </p>
              <h2
                className="mt-2 font-display text-2xl font-bold tracking-tight text-[#111113] sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                Mylar bag designs ready for custom orders.
              </h2>
            </div>

            <div className="-mx-4 overflow-x-auto no-scrollbar px-4 sm:mx-0 sm:px-0">
              <div
                role="tablist"
                aria-label="Filter Mylar bag categories"
                className="inline-flex w-max items-center gap-1 rounded-xl bg-[#EAEAE6] p-1 sm:flex-wrap"
              >
                {FILTER_TABS.map((tab) => {
                  const active = activeCategory === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveCategory(tab)}
                      className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                        active
                          ? 'bg-white text-[#111113] shadow-xs'
                          : 'text-[#52525B] hover:text-[#111113]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[0, 1, 2].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-96 animate-pulse rounded-2xl border border-black/[0.06] bg-white p-4"
                >
                  <div className="aspect-[4/3] w-full rounded-xl bg-[#EAEAE6]" />
                  <div className="mt-4 h-3 w-28 rounded bg-[#EAEAE6]" />
                  <div className="mt-2 h-5 w-48 rounded bg-[#EAEAE6]" />
                  <div className="mt-6 h-11 w-full rounded-xl bg-[#EAEAE6]" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-8 text-center">
              <p className="text-sm text-[#4B4B52]">{loadError}</p>
              <button
                type="button"
                onClick={fetchDesigns}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-[#111113] px-5 py-2 text-xs font-semibold text-white hover:bg-black"
              >
                Retry
              </button>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-10 text-center">
              <p className="text-sm text-[#4B4B52]">
                No Mylar bag designs in this category yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-black/15 px-5 py-2 text-xs font-medium text-[#111113] hover:bg-[#EFEFED]"
              >
                Show All Designs
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {filteredDesigns.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  isOwner={isOwner}
                  isSaved={Boolean(user?.savedDesignIds?.includes(design.id))}
                  onInspect={(item) => setInspectedDesign(item)}
                  onToggleSave={handleToggleSave}
                  onEdit={(item) => openAccountModal(item)}
                  onDelete={handleDeleteDesign}
                />
              ))}
            </div>
          )}
        </section>

        <ProcessAndFaq />
      </main>

      <Footer user={user} onOpenAccount={() => openAccountModal(null)} />

      {isOwner && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#111113] p-1.5 text-white shadow-lg">
          <button
            type="button"
            onClick={() => openAccountModal(null)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0B8A57] px-3.5 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#097549]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload Bag</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="inline-flex h-10 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <DesignLightboxModal
        design={inspectedDesign}
        onClose={() => setInspectedDesign(null)}
      />

      <StudioPortalModal
        open={portalOpen}
        user={user}
        authToken={authToken}
        designs={designs}
        editingDesign={editingDesign}
        onSelectEdit={(design) => setEditingDesign(design)}
        onClose={() => setPortalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
        onDesignSaved={fetchDesigns}
        onDeleteDesign={handleDeleteDesign}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
