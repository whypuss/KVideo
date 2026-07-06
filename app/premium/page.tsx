'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { PremiumPasswordGate } from '@/components/PremiumPasswordGate';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

const GENRE_ROWS = [
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
    'action': '动作', 'comedy': '热门', 'drama': '剧情', 'sci-fi': '科幻',
    'thriller': '惊悚', 'horror': '恐怖', 'war': '战争', 'crime': '犯罪',
    'animation': '动画', 'fantasy': '奇幻', 'adventure': '冒险', 'biography': '传记',
    'history': '历史', 'documentary': '纪录片', 'musical': '音乐', 'family': '家庭',
    'children': '儿童', 'short': '短片', 'western': '西部', 'sport': '运动',
    'mystery': '悬疑', 'chinese-anime': '动画', 'japanese-anime': '动画',
    'imdb-top-250': '热门', 'classic': '经典', 'cult': '邪典', 'experimental': '实验',
    'martial-arts': '动作', 'noir': '黑色', 'superhero': '动作', 'cyberpunk': '科幻',
    'steampunk': '科幻', 'disaster': '动作', 'post-apocalyptic': '科幻', 'fairy-tale': '奇幻',
    'satire': '喜剧', 'parody': '喜剧', 'dark-comedy': '喜剧', 'romantic-comedy': '爱情',
    'action-comedy': '动作', 'comedy-action': '动作', 'mystery-comedy': '悬疑',
    'horror-comedy': '恐怖', 'crime-thriller': '犯罪', 'thriller-mystery': '悬疑',
    'historical': '历史', 'epic': '历史', 'political': '剧情', 'social': '剧情',
    'religion': '剧情', 'environmental': '纪录片', 'neofilms': '热门', 'independent': '剧情',
};

function fetchCategory(tag: string): Promise<any[]> {
  return fetch(`/api/douban/recommend?type=movie&tag=${encodeURIComponent(genreMap[tag] || tag)}&page_limit=12&page_start=0`)
    .then(r => r.json())
    .then(d => d.subjects || [])
    .catch(() => []);
}

function PremiumHomePage() {
  const [categoryMovies, setCategoryMovies] = useState<Record<string, any[]>>({});
  const [categoryLoading, setCategoryLoading] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleRows, setVisibleRows] = useState<typeof GENRE_ROWS>(GENRE_ROWS);

  useEffect(() => {
    const allPromises = GENRE_ROWS.map(row =>
      fetchCategory(row.tag).then(movies => {
        setCategoryMovies(prev => ({ ...prev, [row.tag]: movies }));
        setCategoryLoading(prev => ({ ...prev, [row.tag]: false }));
      })
    );
    Promise.all(allPromises);
  }, []);

  const handleSearch = useCallback((query: string) => {
    // Navigate to search
    window.location.href = `/?q=${encodeURIComponent(query)}`;
  }, []);

  // Filter rows based on active category
  useEffect(() => {
    if (activeCategory === 'all') {
      setVisibleRows(GENRE_ROWS);
    } else {
      setVisibleRows(GENRE_ROWS.filter(r => {
        if (activeCategory === 'movies') return ['action', 'comedy', 'romance', 'sci-fi', 'drama', 'mystery', 'thriller', 'horror', 'war', 'crime', 'fantasy', 'adventure', 'animation', 'musical', 'biography', 'history', 'documentary', 'western', 'sport', 'family', 'short', 'children', 'classic', 'cult', 'experimental', 'martial-arts', 'noir', 'superhero', 'cyberpunk', 'steampunk', 'disaster', 'post-apocalyptic', 'fairy-tale', 'satire', 'parody', 'dark-comedy'].includes(r.tag);
        if (activeCategory === 'series') return ['comedy-action', 'mystery-comedy', 'horror-comedy', 'crime-thriller', 'thriller-mystery', 'historical', 'epic', 'political', 'social', 'religion', 'environmental'].includes(r.tag);
        if (activeCategory === 'anime') return ['chinese-anime', 'japanese-anime', 'anime'].includes(r.tag);
        return false;
      }));
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar onReset={() => window.location.href = '/premium'} activeCategory={activeCategory} onCategoryChange={setActiveCategory} isPremiumMode={true} />

      <div className="animate-fade-in px-4 sm:px-6 md:px-8 pb-8">
        {/* Hero */}
        {categoryMovies['imdb-top-250'] && categoryMovies['imdb-top-250'].length > 0 && (
          <div className="mb-8">
            <Link href={`/?q=${encodeURIComponent(categoryMovies['imdb-top-250'][0].title)}`} className="block">
              <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden rounded-xl shadow-lg">
                {!imageError['hero'] ? (
                  <Image src={categoryMovies['imdb-top-250'][0].cover} alt={categoryMovies['imdb-top-250'][0].title} fill
                    className="object-cover object-center" unoptimized referrerPolicy="no-referrer"
                    onError={() => setImageError(prev => ({ ...prev, hero: true }))} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{categoryMovies['imdb-top-250'][0].title}</h2>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Category rows */}
        <div className="space-y-6">
          {visibleRows.map((row) => {
            const movies = categoryMovies[row.tag] || [];
            const isLoading = categoryLoading[row.tag] === undefined;
            if (!isLoading && movies.length === 0) return null;
            return (
              <div key={row.tag} className="netflix-row">
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3 flex items-center gap-2">
                  <Link href={`/?q=${encodeURIComponent(row.label)}`} className="text-[var(--text-color)] hover:text-[var(--accent-color)] transition">
                    {row.label}
                  </Link>
                </h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-28 h-40 rounded-lg bg-[var(--glass-bg)] animate-pulse" />
                    ))
                  ) : (
                    movies.map((movie: any) => (
                      <Link key={movie.id} href={`/?q=${encodeURIComponent(movie.title)}`} className="flex-shrink-0 group/card focus-within:outline-none" data-focusable>
                        <div className="relative w-28 h-40 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105">
                          <Image src={movie.cover} alt={movie.title} fill
                            className="object-cover object-center" unoptimized referrerPolicy="no-referrer"
                            onError={() => {
                              const imgKey = `${row.tag}-${movie.id}`;
                              setImageError(prev => ({ ...prev, [imgKey]: true }));
                            }} />
                          {imageError[`${row.tag}-${movie.id}`] && (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs text-gray-400">
                              {movie.title}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-2">
                            <p className="text-white text-xs line-clamp-2">{movie.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
          {visibleRows.length === 0 && (
            <div className="text-center py-20 text-[var(--text-muted)]">
              <p className="text-lg">暂无资源</p>
              <Link href="/?q=热门" className="text-[#ff4060] hover:underline mt-2 inline-block">查看热门 →</Link>
            </div>
          )}
        </div>
      </div>

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
    } >
      <PremiumPasswordGate>
        <PremiumHomePage />
      </PremiumPasswordGate>
    </Suspense>
  );
}
