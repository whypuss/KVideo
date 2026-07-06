'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { NetflixHero } from './NetflixHero';
import { NetflixRow } from './NetflixRow';
import { usePopularMovies } from './hooks/usePopularMovies';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
  activeCategory?: string;
}

// All genre rows - always show all (Douban API limitation)
const GENRE_ROWS = [
  { tag: 'action', label: '动作大片' },
  { tag: 'comedy', label: '喜剧' },
  { tag: 'romance', label: '爱情' },
  { tag: 'sci-fi', label: '科幻' },
  { tag: 'drama', label: '剧情' },
  { tag: 'mystery', label: '悬疑犯罪' },
  { tag: 'horror', label: '恐怖惊悚' },
  { tag: 'war', label: '战争' },
  { tag: 'crime', label: '犯罪' },
  { tag: 'animation', label: '动画' },
  { tag: 'biography', label: '传记' },
  { tag: 'fantasy', label: '奇幻冒险' },
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
    'drama': '热门',
    'sci-fi': '热门',
    'thriller': '热门',
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
      <NetflixHero
        movies={heroMovies}
        loading={heroLoading}
        onMovieClick={(movie) => onSearch?.(movie.title)}
      />

      <div className="relative z-10 -mt-20">
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

