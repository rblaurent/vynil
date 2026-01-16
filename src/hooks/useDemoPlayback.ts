import { useState, useCallback, useEffect, useRef } from 'react';
import type { PlaybackState, SpotifyAlbum, SpotifyTrack } from '../types/spotify';
import { MOCK_TRACKS } from '../data/mock-albums';

const TRACK_DURATION = 15000; // 15 seconds per track (for demo visibility)

function createMockTrack(album: SpotifyAlbum, trackIndex: number): SpotifyTrack {
  const trackName = MOCK_TRACKS[trackIndex % MOCK_TRACKS.length];
  return {
    id: `${album.id}-track-${trackIndex}`,
    name: trackName,
    uri: `${album.uri}:track:${trackIndex}`,
    duration_ms: TRACK_DURATION,
    track_number: trackIndex + 1,
    album,
    artists: album.artists,
  };
}

export function useDemoPlayback() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    position: 0,
    duration: TRACK_DURATION,
    track: null,
    album: null,
  });
  const [volume, setVolume] = useState(50);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const currentAlbumRef = useRef<SpotifyAlbum | null>(null);

  // Update position while playing
  useEffect(() => {
    if (playbackState.isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setPlaybackState(prev => {
          const newPosition = prev.position + 1000;

          // Auto-advance to next track
          if (newPosition >= prev.duration) {
            const album = currentAlbumRef.current;
            if (album) {
              const nextIndex = (currentTrackIndex + 1) % album.total_tracks;
              setCurrentTrackIndex(nextIndex);
              const nextTrack = createMockTrack(album, nextIndex);
              return {
                ...prev,
                position: 0,
                track: nextTrack,
              };
            }
          }

          return { ...prev, position: newPosition };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playbackState.isPlaying, currentTrackIndex]);

  const play = useCallback(async (album: SpotifyAlbum) => {
    currentAlbumRef.current = album;
    setCurrentTrackIndex(0);
    const track = createMockTrack(album, 0);

    setPlaybackState({
      isPlaying: true,
      position: 0,
      duration: TRACK_DURATION,
      track,
      album,
    });
  }, []);

  const pause = useCallback(async () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(async () => {
    if (playbackState.track) {
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [playbackState.track]);

  const next = useCallback(async () => {
    const album = currentAlbumRef.current;
    if (!album) return;

    const nextIndex = (currentTrackIndex + 1) % album.total_tracks;
    setCurrentTrackIndex(nextIndex);
    const nextTrack = createMockTrack(album, nextIndex);

    setPlaybackState(prev => ({
      ...prev,
      position: 0,
      track: nextTrack,
    }));
  }, [currentTrackIndex]);

  const previous = useCallback(async () => {
    const album = currentAlbumRef.current;
    if (!album) return;

    // If more than 3 seconds in, restart track; otherwise go to previous
    if (playbackState.position > 3000) {
      setPlaybackState(prev => ({ ...prev, position: 0 }));
    } else {
      const prevIndex = currentTrackIndex === 0
        ? album.total_tracks - 1
        : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      const prevTrack = createMockTrack(album, prevIndex);

      setPlaybackState(prev => ({
        ...prev,
        position: 0,
        track: prevTrack,
      }));
    }
  }, [currentTrackIndex, playbackState.position]);

  const setPlayerVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const togglePlayback = useCallback(async () => {
    if (playbackState.isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [playbackState.isPlaying, pause, resume]);

  return {
    isReady: true,
    deviceId: 'demo-device',
    playbackState,
    volume,
    error: null,
    play,
    pause,
    resume,
    next,
    previous,
    setPlayerVolume,
    togglePlayback,
  };
}
