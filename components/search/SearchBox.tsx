import { useState, FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';
import { SearchHistoryDropdown } from '@/components/search/SearchHistoryDropdown';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { useSearchBoxHandlers } from './hooks/useSearchBoxHandlers';
import { useIsTV } from '@/lib/contexts/TVContext';

interface SearchBoxProps {
    onSearch: (query: string) => void;
    onClear?: () => void;
    initialQuery?: string;
    placeholder?: string;
    isPremium?: boolean;
}

export function SearchBox({ onSearch, onClear, initialQuery = '', placeholder = '搜索电影、电视剧、综艺...', isPremium = false }: SearchBoxProps) {
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);
    const isTV = useIsTV();

    const {
        searchHistory,
        isDropdownOpen,
        highlightedIndex,
        showDropdown,
        hideDropdown,
        addSearch,
        removeSearch,
        clearAll,
        selectHistoryItem,
        navigateDropdown,
        resetHighlight,
    } = useSearchHistory((selectedQuery) => {
        setQuery(selectedQuery);
        onSearch(selectedQuery);
        inputRef.current?.blur();
    }, isPremium);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const {
        handleSubmit,
        handleClear,
        handleInputFocus,
        handleInputBlur,
        handleKeyDown,
    } = useSearchBoxHandlers({
        query,
        setQuery,
        onSearch,
        onClear,
        inputRef,
        isDropdownOpen,
        highlightedIndex,
        searchHistory,
        selectHistoryItem,
        showDropdown,
        hideDropdown,
        addSearch,
        removeSearch,
        clearAll,
        navigateDropdown,
        resetHighlight,
    });

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pr-12 pl-4"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    inputMode={isTV ? 'none' : 'text'}
                />
                {query && (
                    <button type="button" onClick={handleClear}
                        className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                        data-no-spatial>
                        <Icons.X size={16} />
                    </button>
                )}
                <Button type="submit" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Icons.Search size={20} />
                </Button>
            </div>
            <SearchHistoryDropdown
                isOpen={isDropdownOpen}
                searchHistory={searchHistory}
                highlightedIndex={highlightedIndex}
                onSelect={selectHistoryItem}
                onRemove={removeSearch}
                onClearAll={clearAll}
                onNavigate={navigateDropdown}
                onMouseLeave={hideDropdown}
            />
        </form>
    );
}
