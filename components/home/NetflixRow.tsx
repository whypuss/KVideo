/**
 * NetflixRow - Horizontal scrollable row of movie cards
 */

'use client';

import { memo, useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icon';

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
}

interface NetflixRowProps {
  title: string;
  movies: DoubanMovie[];
  loading: boolean;
  hasMore?: boolean;
  onMovieClick?: (movie: DoubanMovie) => void;
  prefetchRef?: React.RefObject<HTMLDivElement | null>;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
}

export const NetflixRow = memo(function NetflixRow({
  title,
  movies,
  loading,
  hasMore = false,
  onMovieClick,
  prefetchRef,
  loadMoreRef,
}: NetflixRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const checkScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll, movies]);

  const scroll = (direction: 'left' | 'right') => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  if (loading && movies.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4 px-4">{title}</h2>
        <div className="flex gap-3 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-36 h-56 bg-[var(--glass-bg)] rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="mb-10 group/row netflix-row">
      <div className="flex items-center gap-2 mb-3 px-4">
        <h2 className="text-lg font-semibold text-[var(--text-color)]">{title}</h2>
        {hasMore && <Icons.ArrowRight size={16} className="text-[var(--text-muted)]" />}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
            data-no-spatial>
            <Icons.ChevronLeft size={24} className="text-white" />
          </button>
        )}

        {canScrollRight && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
            data-no-spatial>
            <Icons.ChevronRight size={24} className="text-white" />
          </button>
        )}

        <div ref={rowRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick}
              imageError={!!imageErrors[movie.id]}
              onImageError={() => handleImageError(movie.id)} />
          ))}
          {hasMore && prefetchRef && <div ref={prefetchRef} className="w-1 h-1 flex-shrink-0" />}
        </div>

        {hasMore && loadMoreRef && <div ref={loadMoreRef} className="h-1 mt-2" />}
      </div>
    </div>
  );
});

function MovieCard({
  movie, onMovieClick, imageError, onImageError,
}: {
  movie: DoubanMovie;
  onMovieClick?: (movie: DoubanMovie) => void;
  imageError: boolean;
  onImageError: () => void;
}) {
  return (
    <Link href={`/?q=${encodeURIComponent(movie.title)}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onMovieClick?.(movie);
      }}
      data-focusable
      className="flex-shrink-0 w-36 group/card cursor-pointer transition-transform duration-200 ease-out"
      style={{ position: 'relative', contentVisibility: 'auto' }}>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[var(--glass-bg)] shadow-lg transition-shadow duration-200 group-hover/card:shadow-xl">
        {!imageError ? (
          <Image src={movie.cover} alt={movie.title} fill
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
            sizes="9rem" unoptimized referrerPolicy="no-referrer" onError={onImageError} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--glass-bg)]">
            <p className="text-xs text-[var(--text-muted)]">暂无</p>
          </div>
        )}
        {movie.rate && parseFloat(movie.rate) > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-0.5 rounded font-medium backdrop-blur-sm">{movie.rate}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-end p-2">
          <p className="text-white text-xs font-medium line-clamp-2">{movie.title}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--text-color-secondary)] truncate">{movie.title}</p>
    </Link>
  );
}
