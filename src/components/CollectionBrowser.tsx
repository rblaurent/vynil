import { useEffect, useMemo, useRef, useState } from 'react';
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
const RACK_SCALE = 1.4; // Scale factor for the whole rack
const SLOT_HEIGHT = 12; // Fixed grid height for each slot (tighter packing)
const SLEEVE_HEIGHT = 160; // Visual height of the sleeve
const BASE_TILT = -78; // Degrees tilted (negative = top toward viewer)
const HOVER_TILT = -40; // Degrees when pulled out to view (more upright)

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

  // Random values for hovered sleeve - changes each time we hover a new sleeve
  const hoverRandoms = useMemo(() => {
    // Helper: apply ±10% randomness to a base value
    const jitter = (base: number) => base * (0.9 + Math.random() * 0.2);

    return {
      rotation: -1 - Math.random(), // Random between -1 and -2
      liftFactor: jitter(1), // ±10% on lift
      tiltDuration: jitter(0.25),
      liftDuration: jitter(0.25),
      liftDelay: jitter(0.05),
      rotateZDuration: jitter(0.3),
      rotateZDelay: jitter(0.1),
    };
  }, [hoveredIndex]);

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
    let rotate = 0;

    if (distance === 0) {
      // Hovered sleeve - pull it out with slight rotation like being held
      tilt = HOVER_TILT;
      lift = -65 * hoverRandoms.liftFactor; // Apply ±10% randomness
      rotate = hoverRandoms.rotation; // Small Z rotation for natural "held" feel
    } else if (distance !== null) {
      // V-shape spread: \\\/////
      const absDist = Math.abs(distance);

      if (distance < 0 && absDist <= 15) {
        // Records BEFORE (above) - being pushed, gradual decay so 15th is barely affected
        const intensity = 38 * (1 - absDist / 16); // 38 at dist 1, ~2 at dist 15
        tilt = BASE_TILT + intensity;
        const slideAmount = 25 * (1 - absDist / 16);
        push = -slideAmount;
      } else if (distance > 0 && absDist <= 6) {
        // Records AFTER (below)
        const intensity = 15 * (1 - absDist / 7);
        tilt = BASE_TILT - intensity;
        const slideAmount = 12 * (1 - absDist / 7);
        push = slideAmount;
      }
    }

    const style: React.CSSProperties = {
      width: SLEEVE_HEIGHT,
      height: SLEEVE_HEIGHT,
      '--sleeve-tilt': `${tilt}deg`,
      '--sleeve-rotate-z': `${rotate}deg`,
      '--sleeve-lift': `${lift + push}px`,
      transformOrigin: 'center bottom',
      boxShadow: distance === 0 ? '0 -8px 32px rgba(0,0,0,0.5)' : 'none',
    };

    // Apply randomized timings to hovered sleeve
    if (distance === 0) {
      Object.assign(style, {
        '--sleeve-tilt-duration': `${hoverRandoms.tiltDuration}s`,
        '--sleeve-lift-duration': `${hoverRandoms.liftDuration}s`,
        '--sleeve-lift-delay': `${hoverRandoms.liftDelay}s`,
        '--sleeve-rotate-z-duration': `${hoverRandoms.rotateZDuration}s`,
        '--sleeve-rotate-z-delay': `${hoverRandoms.rotateZDelay}s`,
      });
    }

    return style;
  };

  return (
    <div className="h-full bg-spotify-dark relative">
      {/* Header - lower z-index so rack can overflow over it */}
      <div className="absolute top-0 left-0 right-0 p-4 border-b border-spotify-elevated z-10 bg-spotify-dark">
        <h2 className="text-xl font-bold text-white">Your Library</h2>
        <p className="text-sm text-gray-400">{albums.length} albums</p>
      </div>

      {/* Vinyl Rack - scrollable, rack can overflow upward */}
      <div className="absolute inset-0 pt-16 overflow-y-auto overflow-x-hidden flex flex-col">
        <div className="flex-1 flex items-center justify-center relative z-20 min-h-0">
          {/* Rack container - vertically centered */}
          <div
            className="relative"
            style={{
              width: SLEEVE_HEIGHT,
              perspective: '800px',
              perspectiveOrigin: 'center center',
              transformStyle: 'preserve-3d',
              transform: `scale(${RACK_SCALE})`,
              transformOrigin: 'center center',
            }}
          >
          {/* Fixed hover grid - invisible, just for interaction */}
          <div
            className="relative"
            style={{ height: albums.length * SLOT_HEIGHT, width: SLEEVE_HEIGHT, transformStyle: 'preserve-3d' }}
          >
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
            style={{ height: albums.length * SLOT_HEIGHT, transformStyle: 'preserve-3d' }}
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
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* The sleeve - bottom anchored at slot bottom, centered */}
                  <div
                    className="sleeve-3d absolute rounded overflow-hidden left-1/2"
                    style={{
                      ...style,
                      bottom: 0,
                      top: 'auto',
                      marginLeft: -SLEEVE_HEIGHT / 2,
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
