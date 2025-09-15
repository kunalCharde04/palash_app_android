import api from './config';

export interface Service {
  // Basic info
  id: string;
  name: string;
  description: string[]; // Array of description points
  shortDescription?: string; // Brief summary for cards/listings
  average_rating?: number;
  total_reviews?: number;
  
  // Media
  media: string[]; 
  
  // Categorization
  category: string; // Main category (e.g., "Yoga", "Meditation", "Breathing")
  tags?: string[]; // Additional tags for searchability
  
  // Pricing
  price: string; // Base price
  currency?: string; // USD, EUR, etc.
  discountPrice?: string; // Optional sale price
  
  // Scheduling
  duration: number; // Length in minutes
  
  // Instructor/provider info
  instructorId?: string;
  instructorName?: string;
  instructorBio?: string;
  
  cancellationPolicy?: string;
  
  // Flags
  featured: boolean;
  isActive: boolean;
  isOnline: boolean; // Virtual vs in-person
  isRecurring?: boolean; // One-time vs recurring
  
  // Location (for in-person services)
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Virtual meeting details (for online services)
  virtualMeetingDetails?: {
    platform: string; // Zoom, Google Meet, etc.
    joinLink?: string;
    password?: string;
  };
  
  // Administrative
  created_at?: Date;
  updated_at?: Date;
}


export interface ServicesResponse {
  message: string;
  createResponse: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalServices: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    services: Service[];
  };
}

export interface ServiceDetailResponse {
  message: string;
  service: Service;
}

interface FetchServicesParams {
  page?: number;
  limit?: number;
}

export const fetchServices = async ({ page = 1, limit = 10 }: FetchServicesParams = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(
      `/services/services-listing/fetch-services?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const fetchServiceById = async (serviceId: string) => {
  try {
    const response = await api.get<ServiceDetailResponse>(
      `/services/services-listing/fetch-services-by-serviceId/${serviceId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching service details:', error);
    throw error;
  }
};

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
}

export interface DayAvailability {
  date: string;
  isBookable: boolean;
  timeSlots: TimeSlot[];
}

export const fetchServiceAvailability = async (serviceId: string) => {
  try {
    // Calculate date range (current date to next month)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const response = await api.post<DayAvailability[]>(
      `/booking/availability/${serviceId}`,
      {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching service availability:', error);
    throw error;
  }
};

