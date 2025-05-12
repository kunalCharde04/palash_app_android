import { configureStore } from '@reduxjs/toolkit'
import authReducer from "@/features/auth/auth-slice";
import bookingReducer from "@/features/bookings/booking-slice";
export const store = configureStore({
  reducer: {authReducer, bookingReducer},
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch