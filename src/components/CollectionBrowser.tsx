import { useEffect, useRef, useState } from 'react';
import type { SpotifyAlbum } from '../types/spotify';

interface CollectionBrowserProps {
  albums: SpotifyAlbum[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectAlbum: (album: SpotifyAlbum) => void;
  selectedAlbum: SpotifyAlbum | null;
}

// Constants
const SLOT_HEIGHT = 28; // Fixed grid height for each slot
const SLEEVE_HEIGHT = 160; // Visual height of the sleeve
const BASE_TILT = 75; // Degrees tilted back when at rest
const HOVER_TILT = 20; // Degrees when pulled out to view

export function CollectionBrowser({
  albums,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectAlbum,
  selectedAlbum,
}: CollectionBrowserProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // Calculate transform for each sleeve based on distance from hovered
  const getSleeveStyle = (index: number, isSelected: boolean) => {
    const distance = hoveredIndex !== null ? index - hoveredIndex : null;

    let tilt = BASE_TILT;
    let lift = 0;
    let push = 0;

    if (distance === 0) {
      // Hovered sleeve - pull it out
      tilt = HOVER_TILT;
      lift = -20;
    } else if (distance !== null && Math.abs(distance) === 1) {
      // Immediate neighbors - compress slightly
      tilt = BASE_TILT + 3;
      push = distance < 0 ? -2 : 2;
    } else if (distance !== null && Math.abs(distance) === 2) {
      // Second neighbors - subtle effect
      tilt = BASE_TILT + 1;
    }

    return {
      height: SLEEVE_HEIGHT,
      transform: `rotateX(${tilt}deg) translateY(${lift + push}px)`,
      transformOrigin: 'center bottom',
      transition: 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
      boxShadow: distance === 0
        ? '0 -8px 32px rgba(0,0,0,0.5)'
        : '0 -2px 8px rgba(0,0,0,0.2)',
      zIndex: distance === 0 ? 100 : 50 - Math.abs(distance ?? index),
    };
  };

  return (
    <div className="h-full flex flex-col bg-spotify-dark">
      <div className="p-4 border-b border-spotify-elevated">
        <h2 className="text-xl font-bold text-white">Your Library</h2>
        <p className="text-sm text-gray-400">{albums.length} albums</p>
      </div>

      {/* Vinyl Rack */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ perspective: '800px' }}
      >
        <div className="relative mx-4 my-6">
          {/* Fixed hover grid - invisible, just for interaction */}
          <div className="relative" style={{ height: albums.length * SLOT_HEIGHT }}>
            {albums.map((album, index) => (
              <div
                key={`hover-${album.id}`}
                className="absolute left-0 right-0 cursor-pointer"
                style={{
                  top: index * SLOT_HEIGHT,
                  height: SLOT_HEIGHT,
                  zIndex: 200, // Above visuals for hover detection
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectAlbum(album)}
              />
            ))}
          </div>

          {/* Visual sleeves - positioned absolutely, transforms computed */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{ height: albums.length * SLOT_HEIGHT }}
          >
            {albums.map((album, index) => {
              const isSelected = selectedAlbum?.id === album.id;
              const isHovered = hoveredIndex === index;
              const style = getSleeveStyle(index, isSelected);

              return (
                <div
                  key={`sleeve-${album.id}`}
                  className="absolute left-0 right-0 overflow-visible"
                  style={{
                    top: index * SLOT_HEIGHT,
                    height: SLOT_HEIGHT,
                  }}
                >
                  {/* The sleeve - bottom anchored at slot bottom */}
                  <div
                    className="absolute left-0 right-0 rounded overflow-hidden"
                    style={{
                      ...style,
                      bottom: 0,
                      top: 'auto',
                    }}
                  >
                    {/* Cover image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: album.images[0]
                          ? `url(${album.images[0].url})`
                          : undefined,
                        backgroundColor: '#282828',
                      }}
                    >
                      {/* Darkening overlay */}
                      <div
                        className="absolute inset-0 transition-opacity duration-200"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                          opacity: isHovered ? 0.5 : 1,
                        }}
                      />

                      {/* Album info */}
                      <div
                        className="absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-200"
                        style={{ opacity: isHovered ? 1 : 0 }}
                      >
                        <p className="text-white font-medium text-sm truncate">
                          {album.name}
                        </p>
                        <p className="text-gray-300 text-xs truncate">
                          {album.artists.map((a) => a.name).join(', ')}
                        </p>
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-spotify-green rounded-full" />
                      )}
                    </div>

                    {/* Spine highlight at top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: isSelected
                          ? '#1DB954'
                          : 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.2))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </div>
          )}
          {!hasMore && albums.length > 0 && (
            <p className="text-gray-500 text-sm">End of collection</p>
          )}
        </div>
      </div>
    </div>
  );
}
