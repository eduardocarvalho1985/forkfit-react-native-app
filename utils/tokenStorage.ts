import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'forkfit_access_token';
const REFRESH_TOKEN_KEY = 'forkfit_refresh_token';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Save JWT tokens to secure storage
 */
export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    console.log('Tokens saved to secure storage successfully');
  } catch (error) {
    console.error('Failed to save tokens to secure storage:', error);
    throw new Error('Failed to save authentication tokens');
  }
};

/**
 * Retrieve stored JWT tokens
 */
export const getTokens = async (): Promise<StoredTokens | null> => {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    
    if (accessToken && refreshToken) {
      console.log('Tokens retrieved from secure storage');
      return { accessToken, refreshToken };
    }
    
    console.log('No tokens found in secure storage');
    return null;
  } catch (error) {
    console.error('Failed to retrieve tokens from secure storage:', error);
    return null;
  }
};

/**
 * Clear stored JWT tokens
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log('Tokens cleared from secure storage successfully');
  } catch (error) {
    console.error('Failed to clear tokens from secure storage:', error);
    throw new Error('Failed to clear authentication tokens');
  }
};

/**
 * Get only the access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Get only the refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Check if user has valid tokens
 */
export const hasValidTokens = async (): Promise<boolean> => {
  try {
    const tokens = await getTokens();
    return tokens !== null && tokens.accessToken.length > 0 && tokens.refreshToken.length > 0;
  } catch (error) {
    console.error('Failed to check token validity:', error);
    return false;
  }
};
