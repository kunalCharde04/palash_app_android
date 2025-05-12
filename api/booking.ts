import api from './config';

export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
}

export interface AvailabilityDay {
    date: string;
    isBookable: boolean;
    timeSlots: TimeSlot[];
}

export interface GetAvailabilityParams {
    startDate: string;
    endDate: string;
}

export const getServiceAvailability = async (serviceId: string): Promise<AvailabilityDay[]> => {
    const response = await api.post(`/booking/availability/${serviceId}`, {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    return response.data;
}; 


export const createBooking = async (bookingData: any): Promise<any> => {
    const response = await api.post('/booking/create-booking', bookingData);
    return response.data;
};

export const getBookingById = async (bookingId: string): Promise<any> => {
    const response = await api.get(`/booking/fetch-booking/${bookingId}`);
    return response.data;
};


export const getBookingsByUserId = async (userId: string): Promise<any> => {
    const response = await api.get(`/booking/fetch-booking-by-user/${userId}`);
    return response.data;
};

export const getBookings = async (): Promise<any> => {
    const response = await api.get('/booking/fetch-bookings');
    return response.data;
};
