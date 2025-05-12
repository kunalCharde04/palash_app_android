import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  payment_status: 'PAID' | 'UNPAID';
  total_amount: number;
  created_at: string;
  updated_at: string;
  service: {
    name: string;
    description: string;
    media: string[];
    instructorName: string;
    instructorBio?: string;
    location?: {
      address: string;
      city: string;
    };
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingState {
  currentBooking: any;
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  reviews: [],
  isLoading: false,
  error: null
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    createBookingStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createBookingSuccess: (state, action: PayloadAction<Booking>) => {
      state.isLoading = false;
      state.currentBooking = action.payload;
      state.error = null;
    },
    createBookingFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    cancelBookingStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    cancelBookingSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      if (state.currentBooking && state.currentBooking.id === action.payload) {
        state.currentBooking.status = 'CANCELLED';
      }
      state.error = null;
    },
    cancelBookingFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    fetchReviewsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchReviewsSuccess: (state, action: PayloadAction<Review[]>) => {
      state.isLoading = false;
      state.reviews = action.payload;
      state.error = null;
    },
    fetchReviewsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    addReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    addReviewSuccess: (state, action: PayloadAction<Review>) => {
      state.isLoading = false;
      state.reviews.push(action.payload);
      state.error = null;
    },
    addReviewFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    updateReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateReviewSuccess: (state, action: PayloadAction<Review>) => {
      state.isLoading = false;
      const index = state.reviews.findIndex(review => review.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
      state.error = null;
    },
    updateReviewFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    deleteReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteReviewSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.reviews = state.reviews.filter(review => review.id !== action.payload);
      state.error = null;
    },
    deleteReviewFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    clearBookingError: (state) => {
      state.error = null;
    }
  }
});

export const {
  createBookingStart,
  createBookingSuccess,
  createBookingFailure,
  cancelBookingStart,
  cancelBookingSuccess,
  cancelBookingFailure,
  fetchReviewsStart,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  addReviewStart,
  addReviewSuccess,
  addReviewFailure,
  updateReviewStart,
  updateReviewSuccess,
  updateReviewFailure,
  deleteReviewStart,
  deleteReviewSuccess,
  deleteReviewFailure,
  clearBookingError
} = bookingSlice.actions;

export default bookingSlice.reducer;
