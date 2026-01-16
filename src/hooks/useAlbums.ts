import { useState, useEffect, useCallback } from 'react';
import type { SpotifyAlbum } from '../types/spotify';
import { fetchSavedAlbums } from '../services/spotify-api';

interface UseAlbumsProps {
  token: string | null;
}

interface UseAlbumsReturn {
  albums: SpotifyAlbum[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAlbums({ token }: UseAlbumsProps): UseAlbumsReturn {
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50;

  const loadAlbums = useCallback(async (reset: boolean = false) => {
    if (!token) return;
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const response = await fetchSavedAlbums(token, LIMIT, currentOffset);
      const newAlbums = response.items.map(item => item.album);

      if (reset) {
        setAlbums(newAlbums);
      } else {
        setAlbums(prev => [...prev, ...newAlbums]);
      }

      setOffset(currentOffset + LIMIT);
      setHasMore(response.next !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums');
    } finally {
      setIsLoading(false);
    }
  }, [token, offset, isLoading]);

  // Load initial albums when token is available
  useEffect(() => {
    if (token && albums.length === 0) {
      loadAlbums(true);
    }
  }, [token]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await loadAlbums(false);
    }
  }, [hasMore, isLoading, loadAlbums]);

  const refresh = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    await loadAlbums(true);
  }, [loadAlbums]);

  return {
    albums,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
