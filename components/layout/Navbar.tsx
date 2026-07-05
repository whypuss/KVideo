'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useSiteIcon } from '@/components/SiteIconProvider';
import { Icons } from '@/components/ui/Icon';
import { siteConfig } from '@/lib/config/site-config';
import { getSession, clearSession, hasPermission, type AuthSession } from '@/lib/store/auth-store';
import { useRuntimeFeatures } from '@/components/RuntimeFeaturesProvider';
import { LogOut } from 'lucide-react';

interface NavbarProps {
    onReset: () => void;
    onSearch?: (query: string) => void;
    query?: string;
    isPremiumMode?: boolean;
}

export function Navbar({ onReset, onSearch, query = '', isPremiumMode = false }: NavbarProps) {
    const settingsHref = isPremiumMode ? '/premium/settings' : '/settings';
    const favoritesHref = isPremiumMode ? '/premium/favorites' : '/favorites';
    const [session] = useState<AuthSession | null>(() => getSe ssion());
    const { iptvEnabled } = useRuntimeFeatures();
    const siteIconSrc = useSiteIcon();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(query);

    const handleLogout = () => {
        fetch('/api/auth/session', { method: 'DELETE' })
            .catch(() => { /* Best effort */ })
            .finally(() => {
                clearSession();
                window.location.href = '/';
            });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery.trim());
            setSearchOpen(false);
        }
    };

    return (
        <nav className="sticky top-0 z-[2000] pt-4 pb-2" style={{
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
        }}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--shadow-sm)] px-3 sm:px-6 py-2 sm:py-4 rounded-[var(--radius-2xl)]" style={{
                    transform: 'translate3d(0, 0, 0)'
                }}>
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <Link
                            href={isPremiumMode ? '/premium' : '/'}
                            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer min-w-0"
                            onClick={onReset}
                            data-focusable
                            data-no-spatial
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center flex-shrink-0">
                                <Image
                                    src={siteIconSrc}
                                    alt={siteConfig.name}
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-color)] truncate">{siteConfig.name}</h1>
                                <p className="text-xs text-[var(--text-color-secondary)] hidden sm:block truncate">{siteConfig.description}</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* IPTV */}
                            {iptvEnabled && hasPermission('iptv_access') && (
                                <Link
                                    href="/iptv"
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                    aria-label="直播"
                                    title="直播"
                                    data-focusable
                                    data-no-spatial
                                    data-tv-hide
                                >
                                    <Icons.TV size={16} className="sm:w-5 sm:h-5" />
                                </Link>
                            )}

                            {/* Search */}
                            <div className="relative flex items-center">
                                {!searchOpen ? (
                                    <button
                                        onClick={() => setSearchOpen(true)}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                        aria-label="搜索"
                                        title="搜索"
                                        data-focusable
                                        data-tv-hide
                                    >
                                        <Icons.Search size={20} />
                                    </button>
                                ) : (
                                    <form onSubmit={handleSearch} className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="搜索电影、电视剧..."
                                            className="w-32 sm:w-48 px-3 py-1.5 text-sm rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] outline-none focus:border-[var(--accent-color)]"
                                            autoFocus
                                            autoComplete="off"
                                        />
                                        <button
                                            type="submit"
                                            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--accent-color)] text-white hover:opacity-80 transition-opacity"
                                            aria-label="搜索"
                                        >
                                            <Icons.Search size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] text-[var(--text-color-secondary)] hover:text-[var(--text-color)] transition-colors"
                                            aria-label="关闭搜索"
                                        >
                                            <Icons.X size={16} />
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* History */}
                            <Link
                                href="/history"
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                aria-label="觀看歷史"
                                title="觀看歷史"
                                data-focusable
                                data-tv-hide
                            >
                                <Icons.Clock size={20} />
                            </Link>

                            {/* Favorites */}
                            <Link
                                href={favoritesHref}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                aria-label="我的收藏"
                                data-focusable
                                data-tv-hide
                            >
                                <Icons.Heart size={20} />
                            </Link>

                            {/* Settings */}
                            <Link
                                href={settingsHref}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                aria-label="设置"
                                data-focusable
                                data-tv-hide
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 -960 960 960" fill="currentColor">
                                    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                                </svg>
                            </Link>

                            <ThemeSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
