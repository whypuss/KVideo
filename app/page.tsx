use client';

import { Suspense, useMemo } from 'react';
import { NoResults } from '@/components/search/NoResults';
import { Navbar } from '@/components/layout/Navbar';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { useLatencyPing } from '@/lib/hooks/useLatencyPing';
import { PopularFeatures } from '@/components/home/PopularFeatures';

function HomePage() {
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
  } = useHomePage();

  const sourceUrls = useMemo(() =>
    availableSources.map(s => ({ id: s.id, baseUrl: s.id })),
    [availableSources]
  );

  const { latencies } = useLatencyPing({
    sourceUrls,
    enabled: hasSearched && results.length > 0,
  });

  return (
    <div className="min-h-screen">
      <Navbar onReset={handleReset} />

      <main className="pb-20">
        {(results.length >= 1 || (!loading && results.length > 0)) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <SearchResults
              results={results}
              availableSources={availableSources}
              loading={loading}
              latencies={latencies}
            />
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <NoResults onReset={handleReset} />
          </div>
        )}

        {!loading && !hasSearched && (
          <PopularFeatures onSearch={handleSearch} />
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-color)] border-t-transparent" />
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
