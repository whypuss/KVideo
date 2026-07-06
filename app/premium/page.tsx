'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { PremiumPasswordGate } from '@/components/PremiumPasswordGate';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { NetflixRow } from '@/components/home/NetflixRow';

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
  // 地區分類
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

function PremiumHomePage() {
  const [categoryMovies, setCategoryMovies] = useState<Record<string, any[]>>({});
  const [categoryLoading, setCategoryLoading] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const allPromises = GENRE_ROWS.map(row => {
      const mappedTag = genreMap[row.tag] || row.tag;
      setCategoryLoading(prev => ({ ...prev, [row.tag]: true }));
      fetch(`/api/douban/recommend?type=movie&tag=${encodeURIComponent(mappedTag)}&page_limit=12&page_start=0`)
        .then(r => r.json())
        .then(d => {
          setCategoryMovies(prev => ({ ...prev, [row.tag]: d.subjects || [] }));
          setCategoryLoading(prev => ({ ...prev, [row.tag]: false }));
        })
        .catch(() => setCategoryLoading(prev => ({ ...prev, [row.tag]: false })));
    });
    Promise.all(allPromises);
  }, []);

  const handleSearch = useCallback((query: string) => {
    window.location.href = `/?q=${encodeURIComponent(query)}`;
  }, []);

  // Filter rows based on active category
  const visibleRows = activeCategory === 'all' ? GENRE_ROWS :
    activeCategory === 'movies' ? GENRE_ROWS.filter(r => ['action','comedy','romance','sci-fi','drama','mystery','thriller','horror','war','crime','fantasy','adventure','animation','musical','biography','history','documentary','western','sport','family','short','children','classic','cult','experimental','martial-arts','noir','superhero','cyberpunk','steampunk','disaster','post-apocalyptic','fairy-tale','satire','parody','dark-comedy'].includes(r.tag)) :
    activeCategory === 'anime' ? GENRE_ROWS.filter(r => ['chinese-anime','japanese-anime','anime'].includes(r.tag)) :
    GENRE_ROWS;

  return (
    <div className="min-h-screen bg-black">
      <Navbar onReset={() => window.location.href = '/premium'} activeCategory={activeCategory} onCategoryChange={setActiveCategory} isPremiumMode={true} />

      <div className="animate-fade-in px-4 sm:px-6 md:px-8 pb-8">
        {/* 單張熱門電影推薦卡 — 縱向顯示 */}
        {categoryMovies['imdb-top-250'] && categoryMovies['imdb-top-250'].length > 0 && (
          <div className="flex justify-center py-6 sm:py-8 md:py-10 mb-6">
            <Link href={`/?q=${encodeURIComponent(categoryMovies['imdb-top-250'][0].title)}`} className="block max-w-xs sm:max-w-sm md:max-w-md">
              <div className="relative w-48 h-72 sm:w-56 sm:h-84 md:w-64 md:h-96 overflow-hidden rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                {!imageError['hero'] ? (
                  <Image src={categoryMovies['imdb-top-250'][0].cover} alt={categoryMovies['imdb-top-250'][0].title} fill
                    className="object-cover object-center" unoptimized referrerPolicy="no-referrer"
                    onError={() => setImageError(prev => ({ ...prev, hero: true }))} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-white text-center drop-shadow-lg">{categoryMovies['imdb-top-250'][0].title}</h2>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 60個分類行 */}
        <div className="space-y-6">
          {visibleRows.map((row) => {
            const movies = categoryMovies[row.tag] || [];
            const isLoading = categoryLoading[row.tag] === undefined;
            if (!isLoading && movies.length === 0) return null;
            return (
              <NetflixRow
                key={row.tag}
                title={row.label}
                movies={movies}
                loading={isLoading}
                hasMore
                onMovieClick={(movie) => handleSearch(movie.title)}
              />
            );
          })}
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
