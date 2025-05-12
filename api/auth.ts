import { storeAuthData } from "@/utils/token";
import { apiClient as api } from ".";

export interface AuthResponse {
  message: string
  accessToken: string | null
  refreshToken: string | null
  user: {
    id: string
    phone_or_email: string
    avatar: string | null
    name: string
    username: string
    date_of_birth: string // ISO date string
    role: 'ADMIN' | 'USER' | string // extend as needed
    created_at: string // ISO date string
    updated_at: string // ISO date string
  } | null
}

export interface RefreshResponse {
    accessToken: string | null
    refreshToken: string | null
    user: AuthResponse['user']
}

export const signInUser = async (phoneOrEmail: string): Promise<any> => {
    try {
        const response = await api.post('/users/auth/sign-in', { phoneOrEmail });
        return response.data;
    } catch(err) {
        console.error('Sign in error:', err);
        throw err;
    }
}

export const signUpUser = async (payload: any): Promise<any> => {
    try {
        const {name, username, emailOrPhone, dob, is_agreed_to_terms} = payload;
        const response = await api.post('/users/auth/sign-up', { 
            name, 
            username, 
            phoneOrEmail: emailOrPhone, 
            dob,
            is_agreed_to_terms
        });
        return response.data;
    } catch(err) {
        console.error('Sign up error:', err);
        throw err;
    }
}

export const verifyOTP = async (payload: any): Promise<AuthResponse> => {
    try {
        const {type, phoneOrEmail, otp} = payload;
        const response = await api.post(
            `/users/auth/${type === 'signup' ? 'verify-signup-otp': 'verify-signin-otp'}`, 
            { phoneOrEmail, otp }
        );
        
        if (response.data?.message) {
            const authData = response.data.message;
            if (!authData.accessToken || !authData.refreshToken || !authData.user) {
                throw new Error('Invalid auth response format');
            }
            await storeAuthData(authData);
            return authData;
        }
        throw new Error('Invalid OTP response format');
    } catch(err) {
        console.error('OTP verification error:', err);
        throw err;
    }
}

export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
    if (!refreshToken) {
        throw new Error('No refresh token provided');
    }

    try {
        // First try the standard endpoint
        try {
            const response = await api.post('/users/auth/refresh-token', { refreshToken });
            const data = response.data?.message || response.data;
            
            if (!data || !data.accessToken || !data.refreshToken || !data.user) {
                throw new Error('Invalid token response format');
            }

            await storeAuthData(data);
            return data;
        } catch (endpointError) {
            // If endpoint doesn't exist, simulate token refresh for development
            if (process.env.NODE_ENV === 'development') {
                console.warn('Using development token refresh');
                const mockResponse = {
                    accessToken: 'dev_' + Date.now(),
                    refreshToken: 'dev_refresh_' + Date.now(),
                    user: {
                        id: 'dev_user',
                        phone_or_email: 'dev@example.com',
                        avatar: null,
                        name: 'Dev User',
                        username: 'devuser',
                        date_of_birth: new Date().toISOString(),
                        role: 'USER',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                };
                await storeAuthData(mockResponse);
                return mockResponse;
            }
            throw endpointError;
        }
    } catch(err) {
        console.error('Token refresh error:', err);
        throw err;
    }
}

export const validateAccessToken = async (accessToken: string): Promise<boolean> => {
    if (!accessToken) {
        return false;
    }

    try {
        // First try the standard endpoint
        try {
            const response = await api.post('/users/auth/validate-token', { accessToken });
            return response.data?.valid === true;
        } catch (endpointError) {
            // If endpoint doesn't exist, simulate validation for development
            if (process.env.NODE_ENV === 'development') {
                console.warn('Using development token validation');
                // In development, consider tokens valid if they start with 'dev_'
                return accessToken.startsWith('dev_');
            }
            throw endpointError;
        }
    } catch(err) {
        console.error('Token validation error:', err);
        return false;
    }
}


