// Spotify API Types

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  release_date: string;
  total_tracks: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  track_number: number;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export interface SavedAlbum {
  added_at: string;
  album: SpotifyAlbum;
}

export interface SavedAlbumsResponse {
  href: string;
  items: SavedAlbum[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
  track: SpotifyTrack | null;
  album: SpotifyAlbum | null;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}
