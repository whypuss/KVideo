use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setQuery('');
    };
    window.addEventListener('openSearch', handleOpen);
    return () => window.removeEventListener('openSearch', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setIsLoading(false);
  };

  const handleSearch = (searchQuery: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      close();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 shadow-2xl">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(query); }}
              placeholder="搜尋電影、電視劇、動漫..."
              className="w-full pl-10 pr-10 py-3 bg-transparent text-[var(--text-color)] placeholder:text-[var(--text-muted)] outline-none text-sm"
              autoFocus
            />
            <button onClick={close} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition cursor-pointer">&times;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
