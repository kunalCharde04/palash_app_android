import { api } from "./config"

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  phone_or_email: string;
  date_of_birth: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}


export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await api.get('/users/profile/me');
    return response.data;
  };