import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface AuthResponse {
  message?: string
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

interface AuthState extends AuthResponse {
  isLoading: boolean
  error: string | null
}

interface AuthID extends AuthState {
    phoneOrEmail: string
}

const initialState: AuthID = {
  message: "",
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  error: null,
  phoneOrEmail: ""
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    signInSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.phoneOrEmail = action.payload
      state.error = null
    },
    signInFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    verifySignInOTPStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    verifySignInOTPSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isLoading = false
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.phoneOrEmail = ""
      state.error = null
    },
    verifySignInOTPFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.phoneOrEmail = ""
    },

    signUpStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    signUpSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.phoneOrEmail = action.payload
    },
    signUpFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    verifySignUpOTPStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    verifySignUpOTPSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isLoading = false
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.phoneOrEmail = ""
      state.error = null
    },
    verifySignUpOTPFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.phoneOrEmail = ""
    },

    refreshTokenStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    refreshTokenSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthResponse['user'] }>) => {
      state.isLoading = false
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.error = null
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.accessToken = null
      state.refreshToken = null
      state.user = null
    },

    logout: (state) => {
      return { ...initialState }
    },

    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  verifySignInOTPStart,
  verifySignInOTPSuccess,
  verifySignInOTPFailure,
  signUpStart,
  signUpSuccess,
  signUpFailure,
  verifySignUpOTPFailure,
  verifySignUpOTPStart,
  verifySignUpOTPSuccess,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  logout,
  clearError
} = authSlice.actions

export default authSlice.reducer