import type { TokenData } from '../types/spotify';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback';
const SCOPES = [
  'streaming',
  'user-library-read',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const TOKEN_STORAGE_KEY = 'spotify_token_data';
const CODE_VERIFIER_KEY = 'spotify_code_verifier';

// Generate a random string for PKCE
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate code challenge from verifier using SHA-256
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Initiate the OAuth authorization flow
export async function initiateAuth(): Promise<void> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use
  localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForToken(code: string): Promise<TokenData> {
  const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);

  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for token');
  }

  const data = await response.json();

  // Clean up code verifier
  localStorage.removeItem(CODE_VERIFIER_KEY);

  const tokenData: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  saveTokenData(tokenData);
  return tokenData;
}

// Refresh the access token
export async function refreshAccessToken(): Promise<TokenData> {
  const tokenData = getTokenData();

  if (!tokenData?.refresh_token) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to refresh token');
  }

  const data = await response.json();

  const newTokenData: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokenData.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  saveTokenData(newTokenData);
  return newTokenData;
}

// Get valid access token, refreshing if necessary
export async function getValidToken(): Promise<string | null> {
  const tokenData = getTokenData();

  if (!tokenData) {
    return null;
  }

  // Refresh if token expires in less than 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  if (tokenData.expires_at - Date.now() < fiveMinutes) {
    try {
      const newTokenData = await refreshAccessToken();
      return newTokenData.access_token;
    } catch {
      clearTokenData();
      return null;
    }
  }

  return tokenData.access_token;
}

// Save token data to localStorage
function saveTokenData(tokenData: TokenData): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
}

// Get token data from localStorage
export function getTokenData(): TokenData | null {
  const data = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Clear token data
export function clearTokenData(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Check if we're on the callback page
export function isCallbackPage(): boolean {
  return window.location.pathname === '/callback';
}

// Get authorization code from URL
export function getAuthCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
}

// Check for auth errors in URL
export function getAuthErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('error');
}
