import api from "./config"

export const getServiceAvailability = async (serviceId: string): Promise<any[]> => {
    const response = await api.post(`/booking/availability/${serviceId}`, {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    return response.data;
}; 