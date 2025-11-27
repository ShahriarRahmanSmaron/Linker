import React, { useState, useEffect } from 'react';
import { Fabric, FabricFilter } from '../types';
import { SearchHeader } from './SearchHeader';
import { SearchFilters } from './SearchFilters';
import { SearchFabricCard } from './SearchFabricCard';
import { SelectionPanel } from './SelectionPanel';
import { MockupModal } from './MockupModal';
import { TechpackModal } from './TechpackModal';
import { Layers, SearchX, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FabricFilter>({ fabrication: '', type: '', gsmRange: '' });
  const [selectedFabrics, setSelectedFabrics] = useState<Fabric[]>([]);

  const [mockupModalFabric, setMockupModalFabric] = useState<Fabric | null>(null);
  const [techpackModalFabric, setTechpackModalFabric] = useState<Fabric | null>(null);

  // API State
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Reset pagination when search criteria change
  useEffect(() => {
    setPage(1);
    setFabrics([]);
  }, [searchTerm, filters]);

  // Fetch fabrics from backend
  useEffect(() => {
    // Only fetch if user has entered search term or applied filters
    const hasSearchCriteria = searchTerm.trim() !== '' ||
      filters.fabrication !== '' ||
      filters.type !== '' ||
      filters.gsmRange !== '';

    // Don't fetch on initial load without any search criteria
    if (!hasSearchCriteria) {
      setFabrics([]);
      setHasMore(false);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }

    const fetchFabrics = async () => {
      try {
        setIsLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '20'); // Load 20 at a time

        if (searchTerm) params.append('search', searchTerm);
        if (filters.fabrication) params.append('group', filters.fabrication);
        if (filters.gsmRange) params.append('weight', filters.gsmRange);

        const response = await fetch(`/api/find-fabrics?${params.toString()}`);

        if (response.ok) {
          const result = await response.json();

          if (page === 1) {
            setFabrics(result.data);
          } else {
            setFabrics(prev => [...prev, ...result.data]);
          }

          setHasMore(result.has_more);
          setTotalResults(result.total);
        } else {
          console.error('Failed to fetch fabrics');
          if (page === 1) setFabrics([]);
        }
      } catch (error) {
        console.error('Error fetching fabrics:', error);
        if (page === 1) setFabrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchFabrics();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Handlers
  const toggleSelection = (fabric: Fabric) => {
    const fabricId = fabric.ref || fabric.id;
    if (selectedFabrics.find(f => (f.ref || f.id) === fabricId)) {
      setSelectedFabrics(prev => prev.filter(f => (f.ref || f.id) !== fabricId));
    } else {
      setSelectedFabrics(prev => [...prev, fabric]);
    }
  };

  const removeSelection = (id: string) => {
    setSelectedFabrics(prev => prev.filter(f => (f.ref || f.id) !== id));
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setFilters({ fabrication: '', type: '', gsmRange: '' });
  };

  const applyQuickFilter = (key: keyof FabricFilter, value: string) => {
    resetAllFilters();
    setTimeout(() => {
      setFilters(prev => ({ ...prev, [key]: value }));
    }, 0);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Simple Nav for Search Page */}
      <nav className="bg-white border-b border-neutral-200 px-4 py-3 sticky top-0 z-30 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-primary-50 p-1.5 rounded-lg mr-2 group-hover:bg-primary-100 transition-colors duration-200">
              <Layers className="h-5 w-5 text-primary-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-neutral-900">
              <span className="text-primary-600">Link</span><span className="text-accent-500">ER</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
              Logged in as <span className="text-neutral-900 font-bold">{user?.name || 'Buyer'}</span>
            </div>
            <button
              onClick={logout}
              className="text-neutral-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <SearchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <SearchFilters filters={filters} setFilters={setFilters} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Results Count - Only show if we have search criteria */}
        {!isLoading && fabrics.length > 0 && (
          <div className="mb-6 flex items-center justify-between animate-fade-in">
            <div className="text-sm text-neutral-500 font-medium">
              Showing <span className="text-neutral-900 font-bold">{fabrics.length}</span> of <span className="text-neutral-900 font-bold">{totalResults}</span> results
            </div>
            {/* Sort option could go here */}
          </div>
        )}

        {/* Loading State (Initial) */}
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
                <div className="h-48 bg-neutral-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-neutral-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-neutral-100 rounded animate-pulse w-1/2" />
                  <div className="space-y-2 pt-4">
                    <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fabrics.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
              {fabrics.map((fabric, index) => {
                const fabricId = fabric.ref || fabric.id;
                return (
                  <div key={`${fabricId}-${index}`} className="h-full" style={{ animationDelay: `${(index % 20) * 50}ms` }}>
                    <SearchFabricCard
                      fabric={fabric}
                      isSelected={!!selectedFabrics.find(f => (f.ref || f.id) === fabricId)}
                      onToggleSelect={toggleSelection}
                      onOpenMockup={setMockupModalFabric}
                      onOpenTechpack={setTechpackModalFabric}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 flex justify-center pb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-full hover:bg-neutral-50 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
                    </>
                  ) : (
                    <>Load More Fabrics <ArrowRight size={16} className="ml-2" /></>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          // Empty state - different messages based on whether user has searched
          (() => {
            const hasSearchCriteria = searchTerm.trim() !== '' ||
              filters.fabrication !== '' ||
              filters.type !== '' ||
              filters.gsmRange !== '';

            if (!hasSearchCriteria) {
              // Initial state - no search yet
              return (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-neutral-300 text-center px-4 animate-fade-in shadow-sm">
                  <div className="bg-primary-50 p-6 rounded-full mb-6 shadow-inner">
                    <SearchX className="h-12 w-12 text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-neutral-900 mb-3">Start Your Fabric Search</h3>
                  <p className="text-neutral-500 mb-8 max-w-md mx-auto text-lg font-light">
                    Use the search bar above or apply filters to find the perfect fabrics for your project.
                  </p>

                  <div className="mt-6">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Quick Start - Try These Categories</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => applyQuickFilter('fabrication', 'Single Jersey')}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Single Jersey
                      </button>
                      <button
                        onClick={() => applyQuickFilter('fabrication', 'Fleece')}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Fleece
                      </button>
                      <button
                        onClick={() => applyQuickFilter('fabrication', 'Pique')}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Pique
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              // No results found for search criteria
              return (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-neutral-300 text-center px-4 animate-fade-in shadow-sm">
                  <div className="bg-neutral-50 p-6 rounded-full mb-6 shadow-inner">
                    <SearchX className="h-12 w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-neutral-900 mb-3">No fabrics found</h3>
                  <p className="text-neutral-500 mb-8 max-w-md mx-auto text-lg font-light">
                    {searchTerm ? (
                      <>We couldn't find any fabrics matching <span className="font-semibold text-neutral-700">"{searchTerm}"</span> with the current filters.</>
                    ) : (
                      <>No fabrics match your current filter selection. Try adjusting your filters.</>
                    )}
                  </p>

                  <button
                    onClick={resetAllFilters}
                    className="bg-primary-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center"
                  >
                    Clear Filters & Try Again <ArrowRight size={18} className="ml-2" />
                  </button>

                  <div className="mt-10">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Or try a popular category</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => applyQuickFilter('fabrication', 'Single Jersey')}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Single Jersey
                      </button>
                      <button
                        onClick={() => applyQuickFilter('fabrication', 'Fleece')}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Fleece
                      </button>
                      <button
                        onClick={() => applyQuickFilter('fabrication', 'Pique')}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Pique
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })()
        )}
      </div>

      {/* Right/Bottom Panel */}
      <SelectionPanel
        selectedFabrics={selectedFabrics}
        onRemove={removeSelection}
        onClear={() => setSelectedFabrics([])}
      />

      {/* Modals */}
      <MockupModal
        fabric={mockupModalFabric}
        isSelected={!!selectedFabrics.find(f => f.id === mockupModalFabric?.id)}
        onToggleSelect={toggleSelection}
        onClose={() => setMockupModalFabric(null)}
      />
      <TechpackModal fabric={techpackModalFabric} onClose={() => setTechpackModalFabric(null)} />

    </div>
  );
};