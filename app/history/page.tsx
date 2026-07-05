use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryList } from '@/components/history/HistoryList';
import { HistoryFooter } from '@/components/history/HistoryFooter';
import { useHistory } from '@/lib/store/history-store';

export default function HistoryPage() {
    const pathname = usePathname();
    const isPremium = pathname?.startsWith('/premium') ?? false;
    const { viewingHistory, removeFromHistory, clearHistory } = useHistory(isPremium);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });

    return (
        <div className="min-h-screen">
            <Navbar onReset={() => {}} />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] overflow-hidden">
                    <HistoryHeader onClose={() => {}} />
                    <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                        <span className="text-sm text-[var(--text-muted)]">{viewingHistory.length} 條記錄</span>
                        <button onClick={() => setDeleteConfirm({ isOpen: true })}
                            className="text-sm text-red-400 hover:text-red-300 transition cursor-pointer" data-no-spatial>清空全部</button>
                    </div>
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
