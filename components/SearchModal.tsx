use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBox } from '@/components/search/SearchBox';

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

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setIsLoading(false);
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      close();
    }, 100);
  }, [router, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 shadow-2xl">
          <SearchBox
            onSearch={handleSearch}
            onClear={() => setQuery('')}
            initialQuery={query}
            isLoading={isLoading}
          />
          {isLoading && (
            <div className="mt-4 flex items-center gap-3 px-2">
              <div className="animate-spin h-4 w-4 border-2 border-[var(--accent-color)] border-t-transparent rounded-full" />
              <span className="text-sm text-[var(--text-muted)]">搜索中...</span>
              <button onClick={close} className="ml-auto text-sm text-[var(--text-muted)] hover:text-[var(--accent-color)] transition cursor-pointer">取消</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
