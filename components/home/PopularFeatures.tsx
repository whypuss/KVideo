'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NetflixRow } from './NetflixRow';
import { usePopularMovies } from './hooks/usePopularMovies';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
  activeCategory?: string;
}

// All genre rows - always show all (Douban API limitation)
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
  { tag: 'animation', label: '動畫' },
  { tag: 'biography', label: '傳記' },
  { tag: 'fantasy', label: '奇幻' },
  { tag: 'adventure', label: '冒險' },
  { tag: 'musical', label: '音樂' },
  { tag: 'history', label: '歷史' },
  { tag: 'documentary', label: '紀錄片' },
  { tag: 'western', label: '西部' },
  { tag: 'sport', label: '運動' },
  { tag: 'news', label: '新聞' },
  { tag: 'family', label: '家庭' },
  { tag: 'short', label: '短片' },
  { tag: 'children', label: '兒童' },
  { tag: 'imdb-top-250', label: '豆瓣熱映' },
  { tag: 'classic', label: '經典' },
  { tag: 'cult', label: '邪典' },
  { tag: 'experimental', label: '實驗' },
  { tag: 'martial-arts', label: '武俠' },
  { tag: 'mystery', label: '推理' },
  { tag: 'noir', label: '黑色' },
  { tag: 'neofilms', label: '新片' },
  { tag: 'independent', label: '獨立' },
];

function getCategoryConfig(activeCategory: string) {
  // TV drama categories
  if (['tv', 'cn-drama', 'kr-drama', 'jp-drama', 'en-drama'].includes(activeCategory)) {
    return {
      contentType: 'tv' as const,
      heroTag: '热门',
    };
  }

  // Anime category
  if (['anime', 'cn-anime', 'jp-anime'].includes(activeCategory)) {
    return {
      contentType: 'movie' as const,
      heroTag: '动画',
    };
  }

  // Movie genre categories - map to Douban-supported tags
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
  };

  const heroTag = genreMap[activeCategory] || '热门';
  return {
    contentType: 'movie' as const,
    heroTag,
  };
}

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
}

export function PopularFeatures({ onSearch, activeCategory = 'all' }: PopularFeaturesProps) {
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [heroTag, setHeroTag] = useState('热门');
  const [allGenreRows, setAllGenreRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Update config when category changes
  useEffect(() => {
    const config = getCategoryConfig(activeCategory);
    setContentType(config.contentType);
    setHeroTag(config.heroTag);
  }, [activeCategory]);

  // Load hero movies
  const heroTags = [{ id: heroTag, label: heroTag, value: heroTag }];
  const { movies: heroMovies, loading: heroLoading } = usePopularMovies(heroTag, heroTags, contentType);

  // Load all genre rows
  useEffect(() => {
    if (!heroTag) return;
    setLoading(true);
    const loadAll = async () => {
      const rows = await Promise.all(GENRE_ROWS.map(async (genre) => {
        try {
          const res = await fetch(`/api/douban/recommend?type=${contentType}&tag=${encodeURIComponent(genre.tag)}&page_limit=20&page_start=0`);
          const data = await res.json();
          return { ...genre, movies: data.subjects || [], loading: false };
        } catch {
          return { ...genre, movies: [], loading: false };
        }
      }));
      setAllGenreRows(rows);
      setLoading(false);
    };
    loadAll();
  }, [contentType, heroTag]);

  // Show all rows that have content
  const visibleRows = useMemo(() => {
    return allGenreRows.filter(row => row.movies && row.movies.length > 0);
  }, [allGenreRows]);

  return (
    <div className="animate-fade-in">
      {heroMovies.length > 0 && (
        <div className="mb-6">
          <Link href={`/?q=${encodeURIComponent(heroMovies[0].title)}`} className="block">
            <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 overflow-hidden rounded-lg">
              {!imageError ? (
                <Image src={heroMovies[0].cover} alt={heroMovies[0].title} fill
                  className="object-cover object-center"
                  unoptimized referrerPolicy="no-referrer"
                  onError={() => setImageError(true)} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4 sm:p-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                    {heroMovies[0].title}
                  </h2>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="relative z-10">
        {visibleRows.map((row) => (
          <NetflixRow
            key={row.tag}
            title={row.label}
            movies={row.movies}
            loading={row.loading}
            hasMore
            onMovieClick={(movie) => onSearch?.(movie.title)}
          />
        ))}
        {visibleRows.length === 0 && !loading && !heroLoading && (
          <div className="text-center py-20 text-[var(--text-muted)]">
            <p className="text-lg">暂无资源</p>
            <Link href="/?q=热门" className="text-[#ff4060] hover:underline mt-2 inline-block">
              查看热门 →
            </Link>
          </div>
        )}
        {loading && visibleRows.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-color)] border-t-transparent mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

