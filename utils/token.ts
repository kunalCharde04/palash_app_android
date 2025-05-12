import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_INFO_KEY = 'auth_user_info';

export const storeAuthData = async (userDetails: any) => {
  try {
    if (userDetails.accessToken) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, String(userDetails.accessToken));
    }
    if (userDetails.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, String(userDetails.refreshToken));
    }
    if (userDetails.user) {
      await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userDetails.user));
    }
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

export const loadAuthData = async () => {
  try {
    const storedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const storedUserInfoString = await SecureStore.getItemAsync(USER_INFO_KEY);

    if (storedAccessToken && storedRefreshToken && storedUserInfoString) {
      try {
        const storedUserInfo = JSON.parse(storedUserInfoString);
        return {
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          user: storedUserInfo
        };
      } catch (parseError) {
        console.error('Error parsing stored user info:', parseError);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading auth data:', error);
    throw error;
  }
};

export const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

export const getAccessToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const getRefreshToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    throw error;
  }
};