/**
 * PopularFeatures - Netflix-style homepage
 */

'use client';

import { useState, useEffect } from 'react';
import { NetflixHero } from './NetflixHero';
import { NetflixRow } from './NetflixRow';
import { usePopularMovies } from './hooks/usePopularMovies';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
  activeCategory?: string;
}

// Map category keys to Douban tags
const CATEGORY_MAP: Record<string, string[]> = {
  all: ['动作', '喜剧', '爱情', '科幻', '剧情', '悬疑', '恐怖', '战争', '犯罪', '动画', '纪录片', '传记'],
  action: ['动作'],
  anime: ['动画', '动画'],
  comedy: ['喜剧'],
  drama: ['剧情'],
  'sci-fi': ['科幻'],
  thriller: ['悬疑', '犯罪', '恐怖'],
  tv: ['动作', '喜剧', '爱情', '科幻', '剧情', '悬疑', '恐怖', '战争', '犯罪', '动画', '纪录片', '传记'],
  'cn-drama': ['动作', '喜剧', '爱情', '科幻', '剧情', '悬疑', '战争'],
  'cn-anime': ['动画'],
  'kr-drama': ['动作', '喜剧', '爱情', '科幻', '剧情', '悬疑'],
  'jp-drama': ['动作', '喜剧', '爱情', '科幻', '剧情', '悬疑'],
  'jp-anime': ['动画'],
  'en-drama': ['动作', '喜剧', '爱情', '科幻', '剧情', '悬疑'],
};

const GENRE_ROWS = [
  { tag: '动作', label: '动作大片' },
  { tag: '喜剧', label: '喜剧' },
  { tag: '爱情', label: '爱情' },
  { tag: '科幻', label: '科幻' },
  { tag: '剧情', label: '剧情' },
  { tag: '悬疑', label: '悬疑犯罪' },
];

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
}

export function PopularFeatures({ onSearch, activeCategory = 'all' }: PopularFeaturesProps) {
  const [contentType, setContentType] = useState<'movie' | 'tv'>(() => {
    if (typeof window === 'undefined') return 'movie';
    return (localStorage.getItem('kvideo_default_content_type') || 'movie') as 'movie' | 'tv';
  });

  // Update content type when category changes
  useEffect(() => {
    if (activeCategory === 'tv' || activeCategory === 'cn-drama' || activeCategory === 'kr-drama' || activeCategory === 'jp-drama' || activeCategory === 'en-drama') {
      setContentType('tv');
    } else {
      setContentType('movie');
    }
  }, [activeCategory]);

  const heroTags = [{ id: 'popular', label: '热门', value: '热门' }];
  const { movies: heroMovies, loading: heroLoading } = usePopularMovies('popular', heroTags, contentType);

  const { movies: recommendMovies, loading: recommendLoading, hasHistory } = usePersonalizedRecommendations(false);

  const [allGenreRows, setAllGenreRows] = useState<any[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      const filteredGenres = GENRE_ROWS.filter(g => CATEGORY_MAP[activeCategory]?.includes(g.tag));
      const rows = await Promise.all(filteredGenres.map(async (genre) => {
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
  }, [contentType, activeCategory]);

  return (
    <div className="animate-fade-in">
      <NetflixHero
        movies={heroMovies}
        loading={heroLoading}
        onMovieClick={(movie) => onSearch?.(movie.title)}
      />

      <div className="relative z-10 -mt-20">
        {hasHistory && recommendMovies.length > 0 && (
          <NetflixRow
            title="为你推荐"
            movies={recommendMovies}
            loading={recommendLoading}
            hasMore
            onMovieClick={(movie) => onSearch?.(movie.title)}
          />
        )}

        {allGenreRows.map((row) => (
          <NetflixRow
            key={row.tag}
            title={row.label}
            movies={row.movies}
            loading={row.loading}
            hasMore
            onMovieClick={(movie) => onSearch?.(movie.title)}
          />
        ))}
      </div>
    </div>
  );
}
