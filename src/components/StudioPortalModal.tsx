import { useState, useEffect, ChangeEvent, FormEvent, DragEvent } from 'react';
import {
  X,
  Upload,
  Eye,
  EyeOff,
  LogOut,
  Check,
  Pencil,
  Trash2,
  Plus,
  Images,
  ArrowUpRight,
  Bookmark,
} from 'lucide-react';
import { DesignCategory, MylarDesign, UserSession } from '../types';
import { FIVERR_GIG_URL, resolveDesignImageUrl } from '../lib/assets';

interface StudioPortalModalProps {
  open: boolean;
  user: UserSession | null;
  authToken: string | null;
  designs: MylarDesign[];
  editingDesign: MylarDesign | null;
  onSelectEdit: (design: MylarDesign | null) => void;
  onClose: () => void;
  onAuthSuccess: (token: string, user: UserSession) => void;
  onLogout: () => void;
  onDesignSaved: () => void;
  onDeleteDesign: (design: MylarDesign) => Promise<void>;
  onToggleSave: (design: MylarDesign) => void;
}

const CATEGORIES: DesignCategory[] = [
  '3.5g Stand-Up',
  'Die-Cut Shape',
  'Holographic Foil',
  'Matte & Spot UV',
];

export function StudioPortalModal({
  open,
  user,
  authToken,
  designs,
  editingDesign,
  onSelectEdit,
  onClose,
  onAuthSuccess,
  onLogout,
  onDesignSaved,
  onDeleteDesign,
  onToggleSave,
}: StudioPortalModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [studioTab, setStudioTab] = useState<'upload' | 'manage'>('upload');

  // Auth inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Studio upload / edit inputs
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DesignCategory>('3.5g Stand-Up');
  const [finish, setFinish] = useState('Matte Soft-Touch + Foil');
  const [dimensions, setDimensions] = useState('4.0" × 5.2" · 3.5g Stand-Up');
  const [description, setDescription] = useState('');
  const [fiverrUrl, setFiverrUrl] = useState(FIVERR_GIG_URL);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (editingDesign) {
      setStudioTab('upload');
      setTitle(editingDesign.title);
      setCategory(editingDesign.category);
      setFinish(editingDesign.finish);
      setDimensions(editingDesign.dimensions);
      setDescription(editingDesign.description);
      setFiverrUrl(editingDesign.fiverrUrl || FIVERR_GIG_URL);
      setImageData(null);
      setImageUrlInput(editingDesign.imageUrl);
    } else {
      setTitle('');
      setCategory('3.5g Stand-Up');
      setFinish('Matte Soft-Touch + Foil');
      setDimensions('4.0" × 5.2" · 3.5g Stand-Up');
      setDescription('');
      setFiverrUrl(FIVERR_GIG_URL);
      setImageData(null);
      setImageUrlInput('');
    }
    setSaveError('');
    setSaveSuccess('');
    setAuthError('');
    setConfirmDeleteId(null);
  }, [editingDesign, open]);

  if (!open) return null;

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        authMode === 'login'
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.token || !data.user) {
        setAuthError(data.error || 'Unable to sign in. Please check your details.');
        return;
      }

      setName('');
      setEmail('');
      setPassword('');
      setStudioTab('upload');
      onAuthSuccess(data.token, data.user);
    } catch {
      setAuthError('Unable to connect right now. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const processFile = (file: File) => {
    setSaveError('');
    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a PNG, JPG, or WebP image file.');
      return;
    }
    if (file.size > 9 * 1024 * 1024) {
      setSaveError('Image must be smaller than 9 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveDesign = async (e: FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setSaveError('');
    setSaveSuccess('');

    if (!title.trim()) {
      setSaveError('Please enter a bag design title.');
      return;
    }

    if (!editingDesign && !imageData && !imageUrlInput.trim()) {
      setSaveError('Please upload a Mylar bag image or paste an image URL.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingDesign ? `/api/designs/${editingDesign.id}` : '/api/designs';
      const method = editingDesign ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          finish: finish.trim(),
          dimensions: dimensions.trim(),
          description: description.trim(),
          fiverrUrl: fiverrUrl.trim() || FIVERR_GIG_URL,
          imageData: imageData || undefined,
          imageUrl: !imageData && imageUrlInput.trim() ? imageUrlInput.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          onLogout();
          setAuthError('Session expired. Please sign in again.');
        } else {
          setSaveError(data.error || 'Failed to save design.');
        }
        return;
      }

      setSaveSuccess(editingDesign ? 'Design updated!' : 'New Mylar bag published!');
      onDesignSaved();

      if (!editingDesign) {
        setTitle('');
        setDescription('');
        setImageData(null);
        setImageUrlInput('');
      } else {
        onSelectEdit(null);
      }
    } catch {
      setSaveError('Network error while saving design.');
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = imageData || (imageUrlInput ? resolveDesignImageUrl(imageUrlInput) : null);
  const savedBags = designs.filter((item) => user?.savedDesignIds?.includes(item.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Account"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-bold text-[#111113] sm:text-xl">
              {!user
                ? authMode === 'login'
                  ? 'Sign In'
                  : 'Create Account'
                : user.role === 'admin'
                  ? 'Studio Workspace'
                  : `Welcome, ${user.name}`}
            </h2>
            <p className="mt-0.5 truncate text-xs text-[#52525B]">
              {!user
                ? 'Sign in or create an account to save your favorite Mylar bag designs.'
                : user.role === 'admin'
                  ? 'Upload new Mylar bag designs or update your storefront.'
                  : user.email}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-black/10 px-3 text-xs font-medium text-[#4B4B52] hover:bg-[#EFEFED] hover:text-[#111113]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#52525B] hover:bg-[#EFEFED] hover:text-[#111113]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {!user ? (
          <div className="mt-5">
            <div className="flex items-center gap-1 rounded-xl bg-[#EAEAE6] p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  authMode === 'login'
                    ? 'bg-white text-[#111113] shadow-xs'
                    : 'text-[#52525B] hover:text-[#111113]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  authMode === 'register'
                    ? 'bg-white text-[#111113] shadow-xs'
                    : 'text-[#52525B] hover:text-[#111113]'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4">
              {authMode === 'register' && (
                <div>
                  <label htmlFor="user-name" className="block text-xs font-medium text-[#111113]">
                    Your Name
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3.5 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-[#111113]">
                  Email
                </label>
                <input
                  id="login-email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3.5 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-medium text-[#111113]">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] pl-3.5 pr-11 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#52525B] hover:text-[#111113]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#066E45] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#055837] disabled:opacity-60"
              >
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </form>
          </div>
        ) : user.role === 'member' ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#111113]">
                Saved Mylar Designs ({savedBags.length})
              </p>
              <a
                href={FIVERR_GIG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#066E45] hover:underline"
              >
                <span>Order Custom on Fiverr</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {savedBags.length === 0 ? (
              <div className="rounded-xl border border-black/[0.08] bg-[#F7F7F5] p-6 text-center">
                <Bookmark className="mx-auto h-6 w-6 text-[#52525B]" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-[#111113]">No saved bags yet</p>
                <p className="mt-1 text-xs text-[#52525B]">
                  Tap the bookmark icon on any Mylar bag card to save designs here for quick Fiverr
                  ordering.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedBags.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-black/[0.08] bg-[#F7F7F5] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={resolveDesignImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="h-14 w-16 shrink-0 rounded-lg bg-white object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#111113]">{item.title}</p>
                        <p className="truncate text-xs text-[#52525B]">
                          {item.category} · {item.finish}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.fiverrUrl || FIVERR_GIG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg bg-[#066E45] px-3.5 text-xs font-semibold text-white hover:bg-[#055837]"
                      >
                        <span>Order Fiverr</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onToggleSave(item)}
                        aria-label={`Remove ${item.title}`}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-[#4B4B52] hover:bg-[#EFEFED]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center gap-1 rounded-xl bg-[#EAEAE6] p-1">
              <button
                type="button"
                onClick={() => {
                  onSelectEdit(null);
                  setStudioTab('upload');
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  studioTab === 'upload'
                    ? 'bg-white text-[#111113] shadow-xs'
                    : 'text-[#52525B] hover:text-[#111113]'
                }`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{editingDesign ? 'Edit Design' : 'Upload New Bag'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioTab('manage')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  studioTab === 'manage'
                    ? 'bg-white text-[#111113] shadow-xs'
                    : 'text-[#52525B] hover:text-[#111113]'
                }`}
              >
                <Images className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Manage Bags ({designs.length})</span>
              </button>
            </div>

            {studioTab === 'upload' ? (
              <form onSubmit={handleSaveDesign} className="mt-5 space-y-4">
                <div>
                  <span className="block text-xs font-medium text-[#111113]">
                    1. Choose Mylar Bag Image
                  </span>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors ${
                      isDragging
                        ? 'border-[#066E45] bg-[#066E45]/5'
                        : 'border-black/20 bg-[#F7F7F5] hover:border-black/35'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    {previewSrc ? (
                      <div className="flex w-full items-center gap-4 text-left">
                        <img
                          src={previewSrc}
                          alt="Mylar bag preview"
                          className="h-20 w-24 shrink-0 rounded-lg bg-white object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#111113]">
                            Image ready to publish
                          </p>
                          <p className="mt-0.5 text-xs text-[#52525B]">
                            Tap to replace with another image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-[#52525B]" aria-hidden="true" />
                        <p className="mt-2 text-xs font-medium text-[#111113]">
                          Tap to choose bag photo or drag &amp; drop
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#52525B]">PNG, JPG, WebP up to 9 MB</p>
                      </>
                    )}
                  </label>

                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      setImageData(null);
                    }}
                    placeholder="Or paste an image URL (optional)"
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#F7F7F5] px-3 text-xs text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bag-title" className="block text-xs font-medium text-[#111113]">
                      2. Bag Title
                    </label>
                    <input
                      id="bag-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Mango Haze 3.5g Foil"
                      className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="bag-category" className="block text-xs font-medium text-[#111113]">
                      3. Category
                    </label>
                    <select
                      id="bag-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DesignCategory)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bag-finish" className="block text-xs font-medium text-[#111113]">
                      Print Finish
                    </label>
                    <input
                      id="bag-finish"
                      type="text"
                      value={finish}
                      onChange={(e) => setFinish(e.target.value)}
                      placeholder="Matte Soft-Touch + Foil"
                      className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="bag-dims" className="block text-xs font-medium text-[#111113]">
                      Size / Weight
                    </label>
                    <input
                      id="bag-dims"
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder='4.0" × 5.2" · 3.5g Stand-Up'
                      className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bag-desc" className="block text-xs font-medium text-[#111113]">
                    Description (Optional)
                  </label>
                  <textarea
                    id="bag-desc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short note about the pouch style or foil accents..."
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-[#F7F7F5] p-3 text-sm text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="bag-fiverr" className="block text-xs font-medium text-[#111113]">
                    Fiverr Order Link
                  </label>
                  <input
                    id="bag-fiverr"
                    type="url"
                    value={fiverrUrl}
                    onChange={(e) => setFiverrUrl(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-black/15 bg-[#F7F7F5] px-3 font-mono text-xs text-[#111113] focus:border-[#066E45] focus:bg-white focus:outline-none"
                  />
                </div>

                {saveError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {saveError}
                  </p>
                )}

                {saveSuccess && (
                  <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>{saveSuccess}</span>
                  </p>
                )}

                <div className="flex items-center gap-3">
                  {editingDesign && (
                    <button
                      type="button"
                      onClick={() => onSelectEdit(null)}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-black/15 px-4 text-sm font-medium text-[#111113] hover:bg-[#EFEFED]"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#066E45] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#055837] disabled:opacity-60"
                  >
                    {saving
                      ? 'Saving...'
                      : editingDesign
                        ? 'Save Changes'
                        : 'Publish Mylar Bag'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-3">
                {designs.length === 0 ? (
                  <p className="rounded-xl border border-black/[0.08] bg-[#F7F7F5] p-6 text-center text-xs text-[#52525B]">
                    No Mylar bags uploaded yet. Switch to Upload New Bag to add your first design.
                  </p>
                ) : (
                  designs.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-[#F7F7F5] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={resolveDesignImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="h-14 w-16 shrink-0 rounded-lg bg-white object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111113]">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-[#52525B]">
                            {item.category} · {item.finish}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectEdit(item);
                            setStudioTab('upload');
                          }}
                          className="inline-flex h-10 items-center gap-1 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-[#111113] hover:bg-[#EFEFED]"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </button>

                        {confirmDeleteId === item.id ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteDesign(item);
                              setConfirmDeleteId(null);
                            }}
                            className="inline-flex h-10 items-center rounded-lg bg-[#B91C1C] px-3 text-xs font-semibold text-white hover:bg-[#991B1B]"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Delete ${item.title}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-[#B91C1C] hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
