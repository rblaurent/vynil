import type { SavedAlbumsResponse, SpotifyAlbum } from '../types/spotify';

const API_BASE = 'https://api.spotify.com/v1';

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error?.message || error.message || 'API request failed');
  }

  return response;
}

// Fetch user's saved albums with pagination
export async function fetchSavedAlbums(
  token: string,
  limit: number = 50,
  offset: number = 0
): Promise<SavedAlbumsResponse> {
  const response = await fetchWithAuth(
    `/me/albums?limit=${limit}&offset=${offset}`,
    token
  );
  return response.json();
}

// Fetch all saved albums (handles pagination)
export async function fetchAllSavedAlbums(token: string): Promise<SpotifyAlbum[]> {
  const albums: SpotifyAlbum[] = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchSavedAlbums(token, limit, offset);
    albums.push(...response.items.map(item => item.album));
    hasMore = response.next !== null;
    offset += limit;
  }

  return albums;
}

// Start playback of an album
export async function playAlbum(
  token: string,
  albumUri: string,
  deviceId?: string
): Promise<void> {
  const body: { context_uri: string; device_id?: string } = {
    context_uri: albumUri,
  };

  const endpoint = deviceId
    ? `/me/player/play?device_id=${deviceId}`
    : '/me/player/play';

  await fetchWithAuth(endpoint, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// Pause playback
export async function pausePlayback(token: string, deviceId?: string): Promise<void> {
  const endpoint = deviceId
    ? `/me/player/pause?device_id=${deviceId}`
    : '/me/player/pause';

  await fetchWithAuth(endpoint, token, {
    method: 'PUT',
  });
}

// Resume playback
export async function resumePlayback(token: string, deviceId?: string): Promise<void> {
  const endpoint = deviceId
    ? `/me/player/play?device_id=${deviceId}`
    : '/me/player/play';

  await fetchWithAuth(endpoint, token, {
    method: 'PUT',
  });
}

// Skip to next track
export async function skipToNext(token: string, deviceId?: string): Promise<void> {
  const endpoint = deviceId
    ? `/me/player/next?device_id=${deviceId}`
    : '/me/player/next';

  await fetchWithAuth(endpoint, token, {
    method: 'POST',
  });
}

// Skip to previous track
export async function skipToPrevious(token: string, deviceId?: string): Promise<void> {
  const endpoint = deviceId
    ? `/me/player/previous?device_id=${deviceId}`
    : '/me/player/previous';

  await fetchWithAuth(endpoint, token, {
    method: 'POST',
  });
}

// Set volume
export async function setVolume(
  token: string,
  volumePercent: number,
  deviceId?: string
): Promise<void> {
  const endpoint = deviceId
    ? `/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`
    : `/me/player/volume?volume_percent=${volumePercent}`;

  await fetchWithAuth(endpoint, token, {
    method: 'PUT',
  });
}

// Transfer playback to a device
export async function transferPlayback(
  token: string,
  deviceId: string,
  play: boolean = false
): Promise<void> {
  await fetchWithAuth('/me/player', token, {
    method: 'PUT',
    body: JSON.stringify({
      device_ids: [deviceId],
      play,
    }),
  });
}

// Seek to position
export async function seekToPosition(
  token: string,
  positionMs: number,
  deviceId?: string
): Promise<void> {
  const endpoint = deviceId
    ? `/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}`
    : `/me/player/seek?position_ms=${positionMs}`;

  await fetchWithAuth(endpoint, token, {
    method: 'PUT',
  });
}
