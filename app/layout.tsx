import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BackToTop } from '@/components/ui/BackToTop';
import { SearchModal } from '@/components/SearchModal';
import { SiteIconProvider } from '@/components/SiteIconProvider';
import { RuntimeFeaturesProvider } from '@/components/RuntimeFeaturesProvider';
import { TVProvider } from '@/lib/contexts/TVContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'KVideo - 你的在線影片搜尋器',
    description: '搜尋所有來源的影片，一次找到你想看的',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh">
            <body className={`${inter.className} min-h-screen`}>
                <ThemeProvider>
                    <SiteIconProvider>
                        <RuntimeFeaturesProvider>
                            <TVProvider>
                                {children}
                                <SearchModal />
                                <BackToTop />
                            </TVProvider>
                        </RuntimeFeaturesProvider>
                    </SiteIconProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
