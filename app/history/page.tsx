'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryList } from '@/components/history/HistoryList';
import { HistoryFooter } from '@/components/history/HistoryFooter';
import { useHistoryStore } from '@/lib/store/history-store';

export default function HistoryPage() {
    const pathname = usePathname();
    const isPremium = pathname?.startsWith('/premium') ?? false;
    const { viewingHistory, removeFromHistory, clearHistory } = useHistoryStore();
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });

    return (
        <div className="min-h-screen">
            <Navbar onReset={() => {}} />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] overflow-hidden">
                    <HistoryHeader onClose={() => {}} />
                    
                    <HistoryList
                        history={viewingHistory}
                        onRemove={(id) => removeFromHistory(id)}
                        isPremium={isPremium}
                    />
                    <HistoryFooter
                        onClearAll={() => setDeleteConfirm({ isOpen: true })}
                    />
                </div>
            </div>
        </div>
    );
}
