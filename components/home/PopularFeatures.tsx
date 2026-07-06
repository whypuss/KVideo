'use client';

import { useState, useEffect } from 'react';
import { NetflixHero } from './NetflixHero';
import { NetflixRow } from './NetflixRow';
import { usePopularMovies } from './hooks/usePopularMovies';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
  activeCategory?: string;
}

// All available genre rows - always show these
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

// Determine content type and hero tag from active category
function getCategoryConfig(activeCategory: string): { contentType: 'movie' | 'tv'; heroTag: string; genreRows: typeof GENRE_ROWS } {
  const tvCategories = ['tv', 'cn-drama', 'kr-drama', 'jp-drama', 'en-drama'];
  const movieCategories = ['action', 'comedy', 'drama', 'sci-fi', 'thriller', 'anime', 'cn-anime', 'jp-anime'];
  
  if (tvCategories.includes(activeCategory)) {
    return { contentType: 'tv', heroTag: '热门', genreRows: GENRE_ROWS };
  }
  
  if (activeCategory === 'anime' || activeCategory === 'cn-anime' || activeCategory === 'jp-anime') {
    return { contentType: 'movie', heroTag: '动画', genreRows: GENRE_ROWS };
  }
  
  // Map genre categories to hero tags
  const genreMap: Record<string, string> = {
    'action': '动作',
    'comedy': '喜剧',
    'drama': '剧情',
    'sci-fi': '科幻',
    'thriller': '悬疑',
  };
  
  const heroTag = genreMap[activeCategory] || '热门';
  return { contentType: 'movie', heroTag, genreRows: GENRE_ROWS };
}

export function PopularFeatures({ onSearch, activeCategory = 'all' }: PopularFeaturesProps) {
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [heroTag, setHeroTag] = useState('热门');
  const [allGenreRows, setAllGenreRows] = useState<any[]>([]);

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
  }, [contentType, heroTag]);

  return (
    <div className="animate-fade-in">
      <NetflixHero
        movies={heroMovies}
        loading={heroLoading}
        onMovieClick={(movie) => onSearch?.(movie.title)}
      />

      <div className="relative z-10 -mt-20">
        {allGenreRows.map((row) => {
          // Only show rows that have content
          if (!row.movies || row.movies.length === 0) return null;
          return (
            <NetflixRow
              key={row.tag}
              title={row.label}
              movies={row.movies}
              loading={row.loading}
              hasMore
              onMovieClick={(movie) => onSearch?.(movie.title)}
            />
          );
        })}
      </div>
    </div>
  );
}

