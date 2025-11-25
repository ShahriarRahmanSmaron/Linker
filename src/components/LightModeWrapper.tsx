import React, { useEffect, useRef } from 'react';

/**
 * Wrapper component that forces light mode for non-landing pages
 * Removes dark class from html element and prevents it from being re-added
 */
export const LightModeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    
    // Force light mode by removing dark class immediately
    root.classList.remove('dark');
    
    // Use MutationObserver to watch for class changes and remove dark class if added
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (root.classList.contains('dark')) {
            root.classList.remove('dark');
          }
        }
      });
    });
    
    // Start observing the html element for class changes
    observerRef.current.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return <>{children}</>;
};

