import { useState, useEffect, useCallback } from 'react';
import type { AuthState } from '../types/spotify';
import {
  initiateAuth,
  exchangeCodeForToken,
  getValidToken,
  clearTokenData,
  isCallbackPage,
  getAuthCodeFromUrl,
  getAuthErrorFromUrl,
  getTokenData,
} from '../services/spotify-auth';

export function useSpotifyAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null,
  });

  // Handle OAuth callback
  useEffect(() => {
    async function handleCallback() {
      if (!isCallbackPage()) return;

      const error = getAuthErrorFromUrl();
      if (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: `Authorization failed: ${error}`,
          token: null,
        });
        // Clear the URL
        window.history.replaceState({}, document.title, '/');
        return;
      }

      const code = getAuthCodeFromUrl();
      if (code) {
        try {
          const tokenData = await exchangeCodeForToken(code);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            token: tokenData.access_token,
          });
        } catch (err) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to authenticate',
            token: null,
          });
        }
        // Clear the URL
        window.history.replaceState({}, document.title, '/');
      }
    }

    handleCallback();
  }, []);

  // Check for existing valid token on mount
  useEffect(() => {
    async function checkExistingToken() {
      if (isCallbackPage()) return;

      const tokenData = getTokenData();
      if (!tokenData) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          token: null,
        });
        return;
      }

      try {
        const token = await getValidToken();
        if (token) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            token,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            error: null,
            token: null,
          });
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          token: null,
        });
      }
    }

    checkExistingToken();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        const token = await getValidToken();
        if (token && token !== authState.token) {
          setAuthState(prev => ({ ...prev, token }));
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Session expired',
          token: null,
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated, authState.token]);

  const login = useCallback(() => {
    initiateAuth();
  }, []);

  const logout = useCallback(() => {
    clearTokenData();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
}
