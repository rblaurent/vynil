import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlaybackState, SpotifyAlbum, SpotifyTrack } from '../types/spotify';
import {
  playAlbum,
  pausePlayback,
  resumePlayback,
  skipToNext,
  skipToPrevious,
  setVolume,
  transferPlayback,
} from '../services/spotify-api';

interface UseSpotifyPlaybackProps {
  token: string | null;
}

interface UseSpotifyPlaybackReturn {
  isReady: boolean;
  deviceId: string | null;
  playbackState: PlaybackState;
  volume: number;
  error: string | null;
  play: (album: SpotifyAlbum) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setPlayerVolume: (volume: number) => Promise<void>;
  togglePlayback: () => Promise<void>;
}

export function useSpotifyPlayback({ token }: UseSpotifyPlaybackProps): UseSpotifyPlaybackReturn {
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(50);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    position: 0,
    duration: 0,
    track: null,
    album: null,
  });

  const playerRef = useRef<Spotify.Player | null>(null);
  const tokenRef = useRef<string | null>(token);

  // Keep token ref updated
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!token) return;

    const initializePlayer = () => {
      const player = new window.Spotify.Player({
        name: 'Vinyl Player',
        getOAuthToken: (cb) => {
          cb(tokenRef.current || '');
        },
        volume: volume / 100,
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        setError(`Initialization error: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        setError(`Authentication error: ${message}`);
      });

      player.addListener('account_error', ({ message }) => {
        setError(`Account error: ${message}. Spotify Premium is required.`);
      });

      player.addListener('playback_error', ({ message }) => {
        setError(`Playback error: ${message}`);
      });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
        // Transfer playback to this device
        if (tokenRef.current) {
          transferPlayback(tokenRef.current, device_id).catch(() => {
            // Ignore transfer errors, device is still ready
          });
        }
      });

      // Not ready
      player.addListener('not_ready', () => {
        setIsReady(false);
        setDeviceId(null);
      });

      // Playback state changes
      player.addListener('player_state_changed', (state) => {
        if (!state) {
          setPlaybackState({
            isPlaying: false,
            position: 0,
            duration: 0,
            track: null,
            album: null,
          });
          return;
        }

        const currentTrack = state.track_window.current_track;

        // Convert SDK types to our custom types
        const convertImages = (images: Spotify.Image[]) =>
          images.map(img => ({
            url: img.url,
            height: img.height ?? 0,
            width: img.width ?? 0,
          }));

        const convertArtists = (artists: Spotify.Entity[]) =>
          artists.map(a => ({
            id: a.uri.split(':')[2],
            name: a.name,
            uri: a.uri,
          }));

        const track: SpotifyTrack | null = currentTrack ? {
          id: currentTrack.id || '',
          name: currentTrack.name,
          uri: currentTrack.uri,
          duration_ms: currentTrack.duration_ms,
          track_number: 0,
          album: {
            id: currentTrack.album.uri.split(':')[2],
            name: currentTrack.album.name,
            uri: currentTrack.album.uri,
            images: convertImages(currentTrack.album.images),
            artists: convertArtists(currentTrack.artists),
            release_date: '',
            total_tracks: 0,
          },
          artists: convertArtists(currentTrack.artists),
        } : null;

        setPlaybackState({
          isPlaying: !state.paused,
          position: state.position,
          duration: state.duration,
          track,
          album: track?.album || null,
        });
      });

      player.connect();
      playerRef.current = player;
    };

    // Check if SDK is already loaded
    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [token]);

  // Update position periodically while playing
  useEffect(() => {
    if (!playbackState.isPlaying || !playerRef.current) return;

    const interval = setInterval(async () => {
      const state = await playerRef.current?.getCurrentState();
      if (state) {
        setPlaybackState(prev => ({
          ...prev,
          position: state.position,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playbackState.isPlaying]);

  const play = useCallback(async (album: SpotifyAlbum) => {
    if (!token || !deviceId) return;
    try {
      await playAlbum(token, album.uri, deviceId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play album');
    }
  }, [token, deviceId]);

  const pause = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      await pausePlayback(token, deviceId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause');
    }
  }, [token, deviceId]);

  const resume = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      await resumePlayback(token, deviceId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume');
    }
  }, [token, deviceId]);

  const next = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      await skipToNext(token, deviceId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip');
    }
  }, [token, deviceId]);

  const previous = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      await skipToPrevious(token, deviceId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go back');
    }
  }, [token, deviceId]);

  const setPlayerVolume = useCallback(async (newVolume: number) => {
    setVolumeState(newVolume);
    if (playerRef.current) {
      await playerRef.current.setVolume(newVolume / 100);
    }
    if (token && deviceId) {
      try {
        await setVolume(token, newVolume, deviceId);
      } catch {
        // Ignore volume errors
      }
    }
  }, [token, deviceId]);

  const togglePlayback = useCallback(async () => {
    if (playbackState.isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [playbackState.isPlaying, pause, resume]);

  return {
    isReady,
    deviceId,
    playbackState,
    volume,
    error,
    play,
    pause,
    resume,
    next,
    previous,
    setPlayerVolume,
    togglePlayback,
  };
}
