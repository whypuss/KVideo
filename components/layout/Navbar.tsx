use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useSiteIcon } from '@/components/SiteIconProvider';
import { siteConfig } from '@/lib/config/site-config';
import { useIsTV } from '@/lib/contexts/TVContext';
import { useHistoryStore } from '@/lib/store/history-store';

interface NavbarProps {
    onReset: () => void;
    activeCategory?: string;
    onCategoryChange?: (category: string) => void;
    isPremiumMode?: boolean;
}

const CATEGORIES = [
    { key: 'all', label: '全部' },
    { key: 'action', label: '動作' },
    { key: 'anime', label: '動漫' },
    { key: 'comedy', label: '喜劇' },
    { key: 'drama', label: '劇情' },
    { key: 'sci-fi', label: '科幻' },
    { key: 'thriller', label: '懸疑' },
];

export function Navbar({ onReset, activeCategory = 'all', onCategoryChange, isPremiumMode = false }: NavbarProps) {
    const settingsHref = isPremiumMode ? '/premium/settings' : '/settings';
    const favoritesHref = isPremiumMode ? '/premium/favorites' : '/favorites';
    const siteIconSrc = useSiteIcon();
    const isTV = useIsTV();
    const { viewingHistory } = useHistoryStore();
    const historyCount = viewingHistory.length;

    if (isTV) {
        return (
            <nav className="sticky top-0 z-[2000] pt-2 pb-1" style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between gap-3 px-4 py-2">
                        <Link href="/" className="flex items-center gap-2 cursor-pointer" onClick={onReset} data-focusable data-no-spatial>
                            <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0">
                                <Image src={siteIconSrc} alt={siteConfig.name} width={32} height={32} unoptimized className="object-contain" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-[#ff4060] to-[#7c4dff] bg-clip-text text-transparent">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <button onClick={() => document.dispatchEvent(new CustomEvent('openSearch'))}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
                                data-focusable data-no-spatial aria-label="Search">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </button>
                            <Link href="/history" className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition cursor-pointer relative" data-focusable data-no-spatial aria-label="History">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color)]"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                                {historyCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{historyCount > 9 ? '9+' : historyCount}</span>}
                            </Link>
                            <Link href={favoritesHref} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg白色/10 transition cursor-pointer" data-focusable data-no-spatial aria-label="Favorites">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color)]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            </Link>
                            <Link href={settingsHref} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg白色/10 transition cursor-pointer" data-focusable data-no-spatial aria-label="Settings">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round" className="text-[var(--text-color)]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="sticky top-0 z-[2000] pt-4 pb-2" style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-[var(--glass-bg)]/80 backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--shadow-sm)] px-3 sm:px-6 py-2 sm:py-4 rounded-[var(--radius-2xl)]" style={{ transform: 'translate3d(0, 0, 0)' }}>
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer min-w-0" onClick={onReset} data-focusable data-no-spatial>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center flex-shrink-0">
                                    <Image src={siteIconSrc} alt={siteConfig.name} width={40} height={40} unoptimized className="object-contain" />
                                </div>
                                <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-[#ff4060] to-[#7c4dff] bg-clip-text text-transparent truncate">{siteConfig.name}</span>
                            </Link>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button onClick={() => document.dispatchEvent(new CustomEvent('openSearch'))} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-lg)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial aria-label="Search">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                </button>
                                <Link href="/history" className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-lg)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial aria-label="History">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="text-[var(--text-color)]"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                                    {historyCount > 0 && <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 rounded-full text-[8px] flex items-center justify-center font-bold px-[2px]">{historyCount > 9 ? '9+' : historyCount}</span>}
                                </Link>
                                <Link href={favoritesHref} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-lg)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial aria-label="Favorites">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color)]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                </Link>
                                <ThemeSwitcher />
                                <Link href={settingsHref} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-lg)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial aria-label="Settings">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color)]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {onCategoryChange && (
                <div className="sticky top-[70px] z-[1999] bg-[var(--glass-bg)]/80 backdrop-blur-md border-b border-[var(--glass-border)]">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                            {CATEGORIES.map((cat) => (
                                <button key={cat.key} onClick={() => onCategoryChange(cat.key)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${activeCategory === cat.key ? 'bg-[#ff4060] text-white shadow-lg shadow-[#ff4060]/30' : 'text-[var(--text-color-secondary)] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-color)]'}`}
                                    data-focusable>{cat.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
