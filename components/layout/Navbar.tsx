use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useSiteIcon } from '@/components/SiteIconProvider';
import { Icons } from '@/components/ui/Icon';
import { siteConfig } from '@/lib/config/site-config';
import { getSession, clearSession, type AuthSession } from '@/lib/store/auth-store';
import { useRuntimeFeatures } from '@/components/RuntimeFeaturesProvider';
import { useIsTV } from '@/lib/contexts/TVContext';
import { useHistoryStore } from '@/lib/store/history-store';
import { usePremiumHistoryStore } from '@/lib/store/history-store';

interface NavbarProps {
    onReset: () => void;
    isPremiumMode?: boolean;
}

export function Navbar({ onReset, isPremiumMode = false }: NavbarProps) {
    const settingsHref = isPremiumMode ? '/premium/settings' : '/settings';
    const favoritesHref = isPremiumMode ? '/premium/favorites' : '/favorites';
    const [session] = useState<AuthSession | null>(() => getSession());
    const { iptvEnabled } = useRuntimeFeatures();
    const siteIconSrc = useSiteIcon();
    const isTV = useIsTV();
    const { viewingHistory } = useHistoryStore();
    const { viewingHistory: premiumHistory } = usePremiumHistoryStore();
    const historyCount = isPremiumMode ? premiumHistory.length : viewingHistory.length;

    const handleLogout = () => {
        fetch('/api/auth/session', { method: 'DELETE' })
            .catch(() => {})
            .finally(() => {
                clearSession();
                window.location.href = '/';
            });
    };

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
                                data-focusable data-no-spatial>
                                <Icons.Search size={20} className="text-[var(--text-color)]" />
                            </button>
                            <Link href={favoritesHref}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition cursor-pointer relative"
                                data-focusable data-no-spatial>
                                <Icons.Clock size={20} className="text-[var(--text-color)]" />
                                {historyCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">
                                        {historyCount > 9 ? '9+' : historyCount}
                                    </span>
                                )}
                            </Link>
                            <FavoriteButton mode="button" className="w-10 h-10 p-0" />
                            <Link href={settingsHref}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
                                data-focusable data-no-spatial>
                                <Icons.Settings size={20} className="text-[var(--text-color)]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-[2000] pt-4 pb-2" style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--shadow-sm)] px-3 sm:px-6 py-2 sm:py-4 rounded-[var(--radius-2xl)]" style={{ transform: 'translate3d(0, 0, 0)' }}>
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <Link href={isPremiumMode ? '/premium' : '/'} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer min-w-0" onClick={onReset} data-focusable data-no-spatial>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center flex-shrink-0">
                                <Image src={siteIconSrc} alt={siteConfig.name} width={40} height={40} unoptimized className="object-contain" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-[#ff4060] to-[#7c4dff] bg-clip-text text-transparent truncate">{siteConfig.name}</span>
                                {session && (
                                    <span className="text-[10px] sm:text-xs text-[var(--text-muted)] truncate">欢迎, {session.accountName}</span>
                                )}
                            </div>
                        </Link>
                        <div className="flex items-center gap-1 sm:gap-2">
                            {iptvEnabled && (
                                <Link href="/iptv" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer min-w-0" data-focusable data-no-spatial>
                                    <Icons.Video size={16} className="text-[var(--accent-color)] flex-shrink-0" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">IPTV</span>
                                </Link>
                            )}
                            <Link href="/sources" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial>
                                <Icons.Folder size={16} className="text-[var(--accent-color)] flex-shrink-0" />
                                <span className="text-xs sm:text-sm hidden sm:inline">来源</span>
                            </Link>
                            <Link href={favoritesHref} className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-lg)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial>
                                <Icons.Heart size={18} className="text-[var(--accent-color)]" />
                            </Link>
                            {session ? (
                                <button onClick={handleLogout} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-[var(--radius-lg)] bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition cursor-pointer" data-focusable data-no-spatial>
                                    <Icons.LogOut size={16} className="flex-shrink-0" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">退出</span>
                                </button>
                            ) : (
                                <Link href="/auth" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--accent-color)] text-white hover:opacity-90 transition cursor-pointer" data-focusable data-no-spatial>
                                    <Icons.LogIn size={16} className="flex-shrink-0" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">登录</span>
                                </Link>
                            )}
                            <ThemeSwitcher />
                            <Link href={settingsHref} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-lg)] hover:bg-[var(--glass-bg-hover)] transition cursor-pointer" data-focusable data-no-spatial>
                                <Icons.Settings size={18} className="text-[var(--text-color)]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
