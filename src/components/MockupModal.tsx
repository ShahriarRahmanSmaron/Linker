
import React, { useState, useEffect } from 'react';
import { Fabric } from '../types';
import { X, Shirt, ZoomIn, Check, Plus, Loader2, ArrowLeft } from 'lucide-react';

interface MockupModalProps {
  fabric: Fabric | null;
  isSelected: boolean;
  onClose: () => void;
  onToggleSelect: (fabric: Fabric) => void;
}

interface MockupData {
  success: boolean;
  views: string[];
  mockups: {
    face?: string;
    back?: string;
    single?: string;
  };
}

interface Garment {
  name: string; // API name (for backend calls, original casing)
  displayName: string; // Display name (for UI, title case)
  imageUrl: string | null;
}

interface GarmentsByCategory {
  [category: string]: Garment[];
}

type ViewMode = 'select' | 'preview';

export const MockupModal: React.FC<MockupModalProps> = ({ fabric, isSelected, onClose, onToggleSelect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [garments, setGarments] = useState<GarmentsByCategory>({});
  const [isLoadingGarments, setIsLoadingGarments] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<string | null>(null);
  
  const [mockupData, setMockupData] = useState<MockupData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'face' | 'back' | 'single'>('face');

  // Fetch available garments when modal opens
  useEffect(() => {
    if (!fabric) {
      setGarments({});
      setMockupData(null);
      setError(null);
      setViewMode('select');
      setSelectedGarment(null);
      return;
    }

    const fetchGarments = async () => {
      try {
        setIsLoadingGarments(true);
        const response = await fetch('/api/garments');
        if (response.ok) {
          const data = await response.json();
          setGarments(data);
        } else {
          console.error('Failed to fetch garments');
        }
      } catch (err) {
        console.error('Error fetching garments:', err);
      } finally {
        setIsLoadingGarments(false);
      }
    };

    fetchGarments();
  }, [fabric]);

  // Generate mockup when garment is selected
  const handleGarmentSelect = async (garment: Garment) => {
    if (!fabric) return;

    try {
      setIsGenerating(true);
      setError(null);
      setSelectedGarment(garment.displayName);
      setViewMode('preview');
      
      const fabricRef = fabric.ref || fabric.id;
      
      // Use the garment.name (which has the correct casing from the API)
      console.log('Generating mockup:', {
        fabric_ref: fabricRef,
        mockup_name: garment.name,
        display_name: garment.displayName
      });
      
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fabric_ref: fabricRef,
          mockup_name: garment.name, // Use original casing
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mockup generation response:', data);
        if (data.success) {
          setMockupData(data);
          // Set initial view based on available mockups
          if (data.mockups.face) setCurrentView('face');
          else if (data.mockups.back) setCurrentView('back');
          else if (data.mockups.single) setCurrentView('single');
        } else {
          const errorMsg = data.error || 'Failed to generate mockup';
          console.error('Mockup generation failed:', errorMsg);
          setError(errorMsg);
        }
      } else {
        const errorText = await response.text();
        console.error('HTTP error:', response.status, errorText);
        setError(`Failed to generate mockup (${response.status}). Please try again.`);
      }
    } catch (err) {
      console.error('Error generating mockup:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setViewMode('select');
    setMockupData(null);
    setSelectedGarment(null);
    setError(null);
  };

  if (!fabric) return null;

  const fabricName = fabric.name || fabric.ref;
  const fabricSupplier = fabric.supplier || 'Unknown Supplier';
  const fabricGsm = typeof fabric.gsm === 'string' ? fabric.gsm : `${fabric.gsm}`;
  const fabricComposition = fabric.composition || fabric.fabrication;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full overflow-hidden max-h-[90vh] animate-fade-in ring-1 ring-white/20 transform transition-all flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          {viewMode === 'preview' && (
            <button
              onClick={handleBack}
              className="flex items-center text-neutral-600 hover:text-primary-600 transition-colors font-medium"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Selection
            </button>
          )}
          {viewMode === 'select' && (
            <h2 className="text-lg font-bold text-neutral-900">Select Garment for {fabricName}</h2>
          )}
          {viewMode === 'preview' && selectedGarment && (
            <h2 className="text-lg font-bold text-neutral-900">{selectedGarment} - {fabricName}</h2>
          )}
          
          <button 
            onClick={onClose}
            className="bg-white p-2 rounded-full hover:bg-neutral-100 shadow-sm text-neutral-500 hover:text-neutral-900 transition-all duration-200 active:scale-90 ml-auto"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'select' && (
            <div className="p-6">
              {/* Loading Garments */}
              {isLoadingGarments && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
                  <p className="text-neutral-600 font-medium">Loading garments...</p>
                </div>
              )}

              {/* Garment Selection Grid */}
              {!isLoadingGarments && Object.keys(garments).length > 0 && (
                <div className="space-y-8">
                  {Object.entries(garments).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center">
                        <div className="h-px flex-1 bg-neutral-200 mr-3"></div>
                        {category}
                        <div className="h-px flex-1 bg-neutral-200 ml-3"></div>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {items.map((garment) => (
                          <button
                            key={garment.name}
                            onClick={() => handleGarmentSelect(garment)}
                            className="group relative bg-white border-2 border-neutral-200 rounded-xl p-3 hover:border-primary-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-95"
                          >
                            <div className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-2">
                              {garment.imageUrl ? (
                                <img
                                  src={garment.imageUrl}
                                  alt={garment.displayName}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    console.error('Failed to load image:', garment.imageUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Shirt size={32} className="text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-neutral-900 text-center group-hover:text-primary-600 transition-colors">
                              {garment.displayName}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Garments */}
              {!isLoadingGarments && Object.keys(garments).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Shirt size={48} className="text-neutral-400 mb-4" />
                  <p className="text-neutral-600 font-medium">No garments available</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Mockup Preview Area */}
              <div className="w-full md:w-2/3 bg-neutral-100 relative flex items-center justify-center p-8 min-h-[400px]">
                {/* Loading State */}
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-16 w-16 text-primary-600 animate-spin mb-4" />
                    <p className="text-neutral-600 font-medium">Generating mockup...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !isGenerating && (
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                      <X className="h-12 w-12 text-red-500" />
                    </div>
                    <p className="text-red-600 font-medium mb-2">Failed to generate mockup</p>
                    <p className="text-neutral-500 text-sm mb-4">{error}</p>
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Try Another Garment
                    </button>
                  </div>
                )}

                {/* Mockup Display */}
                {!isGenerating && !error && mockupData && (
                  <div className="relative w-full max-w-lg">
                    <div className="relative bg-white shadow-2xl rounded-lg overflow-hidden">
                      <img
                        src={mockupData.mockups[currentView] || ''}
                        alt={`${fabricName} - ${currentView}`}
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect fill="%23e5e7eb" width="400" height="600"/%3E%3C/svg%3E';
                        }}
                      />

                      {/* View Selector (if multiple views available) */}
                      {mockupData.views.length > 1 && (
                        <div className="absolute top-4 left-4 flex gap-2">
                          {mockupData.views.includes('face') && (
                            <button
                              onClick={() => setCurrentView('face')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                currentView === 'face'
                                  ? 'bg-primary-600 text-white shadow-lg'
                                  : 'bg-white/90 text-neutral-700 hover:bg-white'
                              }`}
                            >
                              Front
                            </button>
                          )}
                          {mockupData.views.includes('back') && (
                            <button
                              onClick={() => setCurrentView('back')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                currentView === 'back'
                                  ? 'bg-primary-600 text-white shadow-lg'
                                  : 'bg-white/90 text-neutral-700 hover:bg-white'
                              }`}
                            >
                              Back
                            </button>
                          )}
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4">
                        <button
                          onClick={() => window.open(mockupData.mockups[currentView] || '', '_blank')}
                          className="bg-white/90 p-2.5 rounded-xl shadow-lg text-neutral-600 hover:text-primary-600 hover:scale-110 transition-all duration-200"
                        >
                          <ZoomIn size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Sidebar - Only show in preview mode */}
              <div className="w-full md:w-1/3 p-8 flex flex-col bg-white overflow-y-auto border-l border-neutral-200">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-1 leading-tight">{fabricName}</h2>
                  <p className="text-neutral-500 font-medium text-sm">{fabricSupplier}</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Fabrication</h4>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 group hover:bg-neutral-50 transition-colors px-2 rounded">
                      <span className="text-neutral-700 text-sm">Type</span>
                      <span className="font-bold text-neutral-900 text-sm">{fabric.fabrication || fabric.group_name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-100 py-2 group hover:bg-neutral-50 transition-colors px-2 rounded">
                      <span className="text-neutral-700 text-sm">Weight</span>
                      <span className="font-bold text-neutral-900 text-sm">{fabricGsm} GSM</span>
                    </div>
                    {fabricComposition && (
                      <div className="flex items-center justify-between border-b border-neutral-100 py-2 group hover:bg-neutral-50 transition-colors px-2 rounded">
                        <span className="text-neutral-700 text-sm">Composition</span>
                        <span className="font-bold text-neutral-900 text-right max-w-[60%] text-sm">{fabricComposition}</span>
                      </div>
                    )}
                    {fabric.width && (
                      <div className="flex items-center justify-between border-b border-neutral-100 py-2 group hover:bg-neutral-50 transition-colors px-2 rounded">
                        <span className="text-neutral-700 text-sm">Width</span>
                        <span className="font-bold text-neutral-900 text-sm">{fabric.width}"</span>
                      </div>
                    )}
                    {fabric.moq && (
                      <div className="flex items-center justify-between border-b border-neutral-100 py-2 group hover:bg-neutral-50 transition-colors px-2 rounded">
                        <span className="text-neutral-700 text-sm">MOQ</span>
                        <span className="font-bold text-neutral-900 text-sm">{fabric.moq}</span>
                      </div>
                    )}
                  </div>

                  {selectedGarment && (
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Selected Garment</h4>
                      <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-bold text-primary-700">{selectedGarment}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 space-y-3">
                  <button
                    onClick={() => onToggleSelect(fabric)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center active:scale-95 shadow-md ${
                      isSelected
                        ? 'bg-neutral-100 text-primary-700 border-2 border-primary-200 hover:bg-white'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30'
                    }`}
                  >
                    {isSelected ? <Check size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                    {isSelected ? 'Added to Moodboard' : 'Add to Moodboard'}
                  </button>
                  {mockupData && (
                    <button
                      onClick={() => window.open(mockupData.mockups[currentView] || '', '_blank')}
                      className="w-full border border-neutral-200 text-neutral-600 py-3.5 rounded-xl font-bold hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 transition-all duration-200 active:scale-95"
                    >
                      Download Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
