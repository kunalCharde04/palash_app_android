import { api } from "./config"

export interface UserProfile {
  id: string;
  name: string;
  username: string | null;
  phone_or_email: string;
  date_of_birth: string | null;
  avatar?: string;
  role: string;
  is_verified: boolean;
  is_agreed_to_terms: boolean;
  createdAt: string;
  updatedAt: string;
}


export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await api.get('/users/profile/me');
    return response.data;
  };