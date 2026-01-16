import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { SpotifyAlbum } from '../types/spotify';

interface CollectionBrowserProps {
  albums: SpotifyAlbum[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectAlbum: (album: SpotifyAlbum) => void;
  selectedAlbum: SpotifyAlbum | null;
}

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

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="h-full flex flex-col bg-spotify-dark">
      <div className="p-4 border-b border-spotify-elevated">
        <h2 className="text-xl font-bold text-white">Your Library</h2>
        <p className="text-sm text-gray-400">{albums.length} albums</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
              onClick={() => onSelectAlbum(album)}
              className={`
                cursor-pointer group relative
                bg-spotify-card rounded-lg p-3
                hover:bg-spotify-elevated transition-colors
                ${selectedAlbum?.id === album.id ? 'ring-2 ring-spotify-green' : ''}
              `}
            >
              {/* Album Cover */}
              <div className="relative aspect-square mb-3 rounded overflow-hidden shadow-lg">
                {album.images[0] && (
                  <img
                    src={album.images[0].url}
                    alt={album.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl"
                  >
                    <svg
                      className="w-6 h-6 text-black ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Album Info */}
              <h3 className="text-white font-medium text-sm truncate">
                {album.name}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {album.artists.map(a => a.name).join(', ')}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Loading indicator / Load more trigger */}
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading more albums...</span>
            </div>
          )}
          {!hasMore && albums.length > 0 && (
            <p className="text-gray-500 text-sm">No more albums</p>
          )}
        </div>
      </div>
    </div>
  );
}
