'use client';

import { Suspense, useState } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { NoResults } from '@/components/search/NoResults';
import { Navbar } from '@/components/layout/Navbar';
import { SearchResults } from '@/components/home/SearchResults';
import { usePremiumHomePage } from '@/lib/hooks/usePremiumHomePage';
import { PremiumContent } from '@/components/premium/PremiumContent';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { PremiumPasswordGate } from '@/components/PremiumPasswordGate';
import Link from 'next/link';
import Image from 'next/image';

const GENRE_ROWS = [
  // 電影類型
  { tag: 'action', label: '動作' },
  { tag: 'comedy', label: '喜劇' },
  { tag: 'romance', label: '愛情' },
  { tag: 'sci-fi', label: '科幻' },
  { tag: 'drama', label: '劇情' },
  { tag: 'mystery', label: '懸疑' },
  { tag: 'thriller', label: '驚悚' },
  { tag: 'horror', label: '恐怖' },
  { tag: 'war', label: '戰爭' },
  { tag: 'crime', label: '犯罪' },
  { tag: 'fantasy', label: '奇幻' },
  { tag: 'adventure', label: '冒險' },
  { tag: 'animation', label: '動畫' },
  { tag: 'musical', label: '音樂' },
  { tag: 'biography', label: '傳記' },
  { tag: 'history', label: '歷史' },
  { tag: 'documentary', label: '紀錄片' },
  { tag: 'western', label: '西部' },
  { tag: 'sport', label: '運動' },
  { tag: 'family', label: '家庭' },
  { tag: 'short', label: '短片' },
  { tag: 'children', label: '兒童' },
  { tag: 'classic', label: '經典' },
  { tag: 'cult', label: '邪典' },
  { tag: 'experimental', label: '實驗' },
  { tag: 'martial-arts', label: '武俠' },
  { tag: 'noir', label: '黑色' },
  { tag: 'superhero', label: '超級英雄' },
  { tag: 'cyberpunk', label: '賽博朋克' },
  { tag: 'steampunk', label: '蒸汽朋克' },
  { tag: 'disaster', label: '災難' },
  { tag: 'post-apocalyptic', label: '末世' },
  { tag: 'fairy-tale', label: '童話' },
  { tag: 'satire', label: '諷刺' },
  { tag: 'parody', label: '惡搞' },
  { tag: 'dark-comedy', label: '黑色幽默' },
  // 國別/地區
  { tag: 'imdb-top-250', label: '豆瓣熱映' },
  { tag: 'chinese-anime', label: '國產動漫' },
  { tag: 'japanese-anime', label: '日動漫' },
  { tag: 'anime', label: '動漫' },
  { tag: 'romantic-comedy', label: '浪漫喜劇' },
  { tag: 'action-comedy', label: '動作喜劇' },
  { tag: 'comedy-action', label: '喜劇動作' },
  { tag: 'mystery-comedy', label: '喜劇懸疑' },
  { tag: 'horror-comedy', label: '喜劇恐怖' },
  { tag: 'crime-thriller', label: '犯罪驚悚' },
  { tag: 'thriller-mystery', label: '驚悚懸疑' },
  { tag: 'historical', label: '歷史' },
  { tag: 'epic', label: '史詩' },
  { tag: 'political', label: '政治' },
  { tag: 'social', label: '社會' },
  { tag: 'religion', label: '宗教' },
  { tag: 'environmental', label: '環保' },
];

const genreMap: Record<string, string> = {
    'action': '动作',
    'comedy': '热门',
    'drama': '剧情',
    'sci-fi': '科幻',
    'thriller': '惊悚',
    'horror': '恐怖',
    'war': '战争',
    'crime': '犯罪',
    'animation': '动画',
    'fantasy': '奇幻',
    'adventure': '冒险',
    'biography': '传记',
    'history': '历史',
    'documentary': '纪录片',
    'musical': '音乐',
    'family': '家庭',
    'children': '儿童',
    'short': '短片',
    'western': '西部',
    'sport': '运动',
    'mystery': '悬疑',
    'chinese-anime': '动画',
    'japanese-anime': '动画',
    'imdb-top-250': '热门',
    'classic': '经典',
    'cult': '邪典',
    'experimental': '实验',
    'martial-arts': '动作',
    'noir': '黑色',
    'superhero': '动作',
    'cyberpunk': '科幻',
    'steampunk': '科幻',
    'disaster': '动作',
    'post-apocalyptic': '科幻',
    'fairy-tale': '奇幻',
    'satire': '喜剧',
    'parody': '喜剧',
    'dark-comedy': '喜剧',
    'romantic-comedy': '爱情',
    'action-comedy': '动作',
    'comedy-action': '动作',
    'mystery-comedy': '悬疑',
    'horror-comedy': '恐怖',
    'crime-thriller': '犯罪',
    'thriller-mystery': '悬疑',
    'historical': '历史',
    'epic': '历史',
    'political': '剧情',
    'social': '剧情',
    'religion': '剧情',
    'environmental': '纪录片',
    'neofilms': '热门',
    'independent': '剧情',
    'halloween': '惊悚',
    'christmas': '热门',
    'spring-festival': '热门',
    'summer-movie': '热门',
    'romantic': '爱情',
};

function PremiumHomePage() {
    const {
        query,
        hasSearched,
        loading,
        results,
        availableSources,
        completedSources,
        totalSources,
        handleSearch,
        handleReset,
        handleCancelSearch,
    } = usePremiumHomePage();
    const [categoryMovies, setCategoryMovies] = useState<Record<string, any[]>>({});
    const [categoryLoading, setCategoryLoading] = useState<Record<string, boolean>>({});
    const [imageError, setImageError] = useState<Record<string, boolean>>({});

    const fetchForTag = async (tag: string) => {
        if (categoryMovies[tag]) return;
        setCategoryLoading(prev => ({ ...prev, [tag]: true }));
        try {
            const res = await fetch(`/api/douban/recommend?type=movie&tag=${encodeURIComponent(genreMap[tag] || tag)}&page_limit=15&page_start=0`);
            const data = await res.json();
            if (data.subjects) {
                setCategoryMovies(prev => ({ ...prev, [tag]: data.subjects }));
            }
        } catch {
            // ignore
        }
        setCategoryLoading(prev => ({ ...prev, [tag]: false }));
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Glass Navbar */}
            <Navbar onReset={handleReset} isPremiumMode={true} />

            {hasSearched ? (
                <>
                    {/* Search Form */}
                    <div className="max-w-7xl mx-auto px-4 mt-6 mb-8 relative" style={{
                        transform: 'translate3d(0, 0, 0)',
                        zIndex: 1000
                    }}>
                        <SearchForm
                            onSearch={handleSearch}
                            onClear={handleReset}
                            onCancelSearch={handleCancelSearch}
                            isLoading={loading}
                            initialQuery={query}
                            currentSource=""
                            checkedSources={completedSources}
                            totalSources={totalSources}
                            placeholder="输入关键词开始搜索..."
                            isPremium={true}
                        />
                    </div>

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                        {(results.length >= 1 || (!loading && results.length > 0)) && (
                            <SearchResults
                                results={results}
                                availableSources={availableSources}
                                loading={loading}
                                isPremium={true}
                            />
                        )}
                        {!loading && hasSearched && results.length === 0 && (
                            <NoResults onReset={handleReset} />
                        )}
                    </main>
                </>
            ) : (
                <>
                    {/* Premium Content - Netflix style */}
                    <div className="animate-fade-in px-4 sm:px-6 md:px-8 pb-8">
                        {/* Hero card */}
                        {categoryMovies['imdb-top-250'] && categoryMovies['imdb-top-250'].length > 0 && (
                            <div className="mb-8">
                                <Link href={`/?q=${encodeURIComponent(categoryMovies['imdb-top-250'][0].title)}`} className="block">
                                    <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden rounded-xl shadow-lg">
                                        {!imageError['hero'] ? (
                                            <Image src={categoryMovies['imdb-top-250'][0].cover} alt={categoryMovies['imdb-top-250'][0].title} fill
                                                className="object-cover object-center"
                                                unoptimized referrerPolicy="no-referrer"
                                                onError={() => setImageError(prev => ({ ...prev, hero: true }))} />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                        <div className="absolute inset-0 flex items-end p-6">
                                            <div className="max-w-2xl">
                                                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-2">
                                                    {categoryMovies['imdb-top-250'][0].title}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* PremiumContent as fallback */}
                        <PremiumContent onSearch={handleSearch} />
                    </div>
                </>
            )}

            {/* Favorites Sidebar - Left */}
            <FavoritesSidebar isPremium={true} />
        </div>
    );
}

export default function PremiumPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent"></div>
            </div>
        }>
            <PremiumPasswordGate>
                <PremiumHomePage />
            </PremiumPasswordGate>
        </Suspense>
    );
}
