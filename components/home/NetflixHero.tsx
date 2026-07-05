/**
 * NetflixHero - Featured movie banner
 */

'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icon';

interface HeroMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
}

interface NetflixHeroProps {
  movies: HeroMovie[];
  loading: boolean;
  onMovieClick?: (movie: HeroMovie) => void;
}

export const NetflixHero = memo(function NetflixHero({
  movies, loading, onMovieClick,
}: NetflixHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.min(movies.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const current = movies[currentIndex % movies.length];

  if (loading || !current) {
    return (
      <div className="relative h-[50vh] min-h-[300px] max-h-[500px] bg-[var(--glass-bg)] animate-pulse">
        <div className="absolute inset-0 flex items-end p-8">
          <div className="w-1/2">
            <div className="h-12 w-3/4 bg-[var(--glass-border)] rounded mb-4" />
            <div className="h-4 w-1/2 bg-[var(--glass-border)] rounded mb-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
      {!imageError ? (
        <Image src={current.cover} alt={current.title} fill
          className="object-cover object-center"
          priority unoptimized referrerPolicy="no-referrer"
          onError={() => setImageError(true)} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="absolute inset-0 flex items-end pb-12 px-8">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            {current.title}
          </h1>
          {current.rate && parseFloat(current.rate) > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-yellow-400 font-semibold">★ {current.rate}</span>
              <span className="text-white/70 text-sm">豆瓣評分</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Link href={`/?q=${encodeURIComponent(current.title)}`}
              onClick={(e) => {
                e.preventDefault();
                onMovieClick?.(current);
              }}
              className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded font-semibold hover:bg-white/90 transition cursor-pointer"
              data-focusable>
              <Icons.Play size={18} />
              <span>播放</span>
            </Link>
          </div>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="absolute bottom-6 right-8 flex gap-2">
          {movies.slice(0, 5).map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
              data-no-spatial />
          ))}
        </div>
      )}
    </div>
  );
});
