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

// All available genre rows
const GENRE_ROWS = [
  { tag: '动作', label: '动作大片' },
  { tag: '喜剧', label: '喜剧' },
  { tag: '爱情', label: '爱情' },
  { tag: '科幻', label: '科幻' },
  { tag: '剧情', label: '剧情' },
  { tag: '悬疑', label: '悬疑犯罪' },
  { tag: '恐怖', label: '恐怖惊悚' },
  { tag: '战争', label: '战争' },
  { tag: '犯罪', label: '犯罪' },
  { tag: '动画', label: '动画' },
  { tag: '传记', label: '传记' },
  { tag: '奇幻', label: '奇幻冒险' },
];

// Category config: map category key to {contentType, heroTag, genreRowFilter}
function getCategoryConfig(activeCategory: string) {
  // TV drama categories
  if (['tv', 'cn-drama', 'kr-drama', 'jp-drama', 'en-drama'].includes(activeCategory)) {
    return {
      contentType: 'tv' as const,
      heroTag: '热门',
      showAllRows: true,
    };
  }

  // Anime category
  if (['anime', 'cn-anime', 'jp-anime'].includes(activeCategory)) {
    return {
      contentType: 'movie' as const,
      heroTag: '动画',
      showAllRows: false,
      genreRowTags: ['动画', '奇幻'],
    };
  }

  // Movie genre categories
  const genreMap: Record<string, { heroTag: string; genreRowTags: string[] }> = {
    'action': { heroTag: '动作', genreRowTags: ['动作', '科幻', '奇幻', '战争', '犯罪'] },
    'comedy': { heroTag: '喜剧', genreRowTags: ['喜剧', '爱情', '剧情'] },
    'drama': { heroTag: '剧情', genreRowTags: ['剧情', '爱情', '传记'] },
    'sci-fi': { heroTag: '科幻', genreRowTags: ['科幻', '动作', '奇幻'] },
    'thriller': { heroTag: '悬疑', genreRowTags: ['悬疑', '犯罪', '恐怖'] },
  };

  const config = genreMap[activeCategory];
  if (config) {
    return {
      contentType: 'movie' as const,
      heroTag: config.heroTag,
      showAllRows: false,
      genreRowTags: config.genreRowTags,
    };
  }

  // Default: all
  return {
    contentType: 'movie' as const,
    heroTag: '热门',
    showAllRows: true,
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
  const [filteredRows, setFilteredRows] = useState<typeof GENRE_ROWS>([]);
  const [allGenreRows, setAllGenreRows] = useState<any[]>([]);

  // Update config when category changes
  useEffect(() => {
    const config = getCategoryConfig(activeCategory);
    setContentType(config.contentType);
    setHeroTag(config.heroTag);
    
    // Filter genre rows based on category
    if (config.showAllRows) {
      setFilteredRows(GENRE_ROWS);
    } else if (config.genreRowTags) {
      setFilteredRows(GENRE_ROWS.filter(r => config.genreRowTags!.includes(r.tag)));
    } else {
      setFilteredRows(GENRE_ROWS);
    }
  }, [activeCategory]);

  // Load hero movies
  const heroTags = [{ id: heroTag, label: heroTag, value: heroTag }];
  const { movies: heroMovies, loading: heroLoading } = usePopularMovies(heroTag, heroTags, contentType);

  // Load all genre rows data
  useEffect(() => {
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
    };
    loadAll();
  }, [contentType]);

  // Filter visible rows based on active category
  const visibleRows = useMemo(() => {
    if (filteredRows.length === 0) return [];
    return allGenreRows
      .filter(row => filteredRows.some(fr => fr.tag === row.tag))
      .filter(row => row.movies && row.movies.length > 0);
  }, [allGenreRows, filteredRows]);

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
        {visibleRows.length === 0 && !heroLoading && (
          <div className="text-center py-20 text-[var(--text-muted)]">
            <p className="text-lg">暂无{activeCategory !== 'all' ? activeCategory : ''}類資源</p>
            <Link href="/?q=热门" className="text-[#ff4060] hover:underline mt-2 inline-block">
              查看熱門影片 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

