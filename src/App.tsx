import { useState, useMemo } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyPlayback } from './hooks/useSpotifyPlayback';
import { useDemoPlayback } from './hooks/useDemoPlayback';
import { useAlbums } from './hooks/useAlbums';
import { SpotifyAuth } from './components/SpotifyAuth';
import { Turntable } from './components/Turntable';
import { CollectionBrowser } from './components/CollectionBrowser';
import { PlaybackControls } from './components/PlaybackControls';
import { MOCK_ALBUMS } from './data/mock-albums';
import type { SpotifyAlbum } from './types/spotify';

// Check if we're in demo mode (no Spotify Client ID configured)
const isDemoMode = !import.meta.env.VITE_SPOTIFY_CLIENT_ID;

function App() {
  // Auth - only used in non-demo mode
  const auth = useSpotifyAuth();
  const { isAuthenticated, isLoading, error, token, login, logout } = isDemoMode
    ? { isAuthenticated: true, isLoading: false, error: null, token: null, login: () => {}, logout: () => {} }
    : auth;

  // Playback - use demo or real based on mode
  const realPlayback = useSpotifyPlayback({ token });
  const demoPlayback = useDemoPlayback();
  const {
    isReady,
    playbackState,
    volume,
    error: playbackError,
    play,
    togglePlayback,
    next,
    previous,
    setPlayerVolume,
  } = isDemoMode ? demoPlayback : realPlayback;

  // Albums - use mock or real based on mode
  const realAlbums = useAlbums({ token });
  const { albums, isLoading: albumsLoading, hasMore, loadMore } = isDemoMode
    ? { albums: MOCK_ALBUMS, isLoading: false, hasMore: false, loadMore: async () => {} }
    : realAlbums;

  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);

  // Calculate album progress (not just track progress)
  // Tonearm should represent position within the entire album
  const progress = useMemo(() => {
    const { track, album, position, duration } = playbackState;
    if (!track || !album || album.total_tracks === 0 || duration === 0) {
      return 0;
    }

    const completedTracks = track.track_number - 1;
    const currentTrackProgress = position / duration;
    return (completedTracks + currentTrackProgress) / album.total_tracks;
  }, [playbackState]);

  // Get the currently displayed album (selected or playing)
  const displayedAlbum = playbackState.album || selectedAlbum;

  // Handle album selection
  const handleSelectAlbum = async (album: SpotifyAlbum) => {
    setSelectedAlbum(album);
    if (isReady) {
      await play(album);
    }
  };

  // Show loading state (only in non-demo mode)
  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-spotify-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated (only in non-demo mode)
  if (!isDemoMode && !isAuthenticated) {
    return <SpotifyAuth onLogin={login} error={error} />;
  }

  return (
    <div className="min-h-screen bg-spotify-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-spotify-dark/95 backdrop-blur border-b border-spotify-elevated">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-spotify-green">Vinyl</span> Player
            {isDemoMode && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-600 text-white rounded">
                DEMO
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4">
            {isDemoMode && (
              <span className="text-yellow-500 text-sm">
                No Spotify credentials - running in demo mode
              </span>
            )}
            {!isDemoMode && !isReady && (
              <span className="text-yellow-500 text-sm">
                Connecting to Spotify...
              </span>
            )}
            {playbackError && (
              <span className="text-red-400 text-sm">
                {playbackError}
              </span>
            )}
            {!isDemoMode && (
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 min-h-screen">
        <div className="flex h-[calc(100vh-10rem)]">
          {/* Turntable Section */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <Turntable
              album={displayedAlbum}
              isPlaying={playbackState.isPlaying}
              progress={progress}
            />
          </div>

          {/* Collection Browser Sidebar */}
          <div className="w-[28rem] lg:w-[32rem] border-l border-spotify-elevated overflow-visible">
            <CollectionBrowser
              albums={albums}
              isLoading={albumsLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onSelectAlbum={handleSelectAlbum}
              selectedAlbum={selectedAlbum}
            />
          </div>
        </div>
      </main>

      {/* Playback Controls */}
      <PlaybackControls
        playbackState={playbackState}
        volume={volume}
        onTogglePlayback={togglePlayback}
        onNext={next}
        onPrevious={previous}
        onVolumeChange={setPlayerVolume}
      />
    </div>
  );
}

export default App;
