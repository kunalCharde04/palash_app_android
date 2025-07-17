import axios from "axios";
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.253:8080";

console.log("BASE_URL: ", BASE_URL);

export const api = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: {
        'Content-Type': "application/json",
    }
})

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    // Don't add token for auth endpoints
    if (
      config.url?.includes('/users/auth/sign-up') ||
      config.url?.includes('/users/auth/sign-in') ||
      config.url?.includes('/users/auth/verify-signup-otp')||
      config.url?.includes('/users/auth/verify-signin-otp')||
      config.url?.includes('/users/auth/refresh-token')
    ) {
      return config;
    }

    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;