import api from './config';

export const fetchMembershipPlans = async () => {
    const response = await api.get('/memberships/fetch-membership-plans');
    return response.data;
};


export const createMembershipOrder = async (params: any) => {
  const response = await api.post('/memberships/create-membership-order', params);
  return response.data;
};


export const verifyMembershipOrder = async (params: any) => {
  const response = await api.post('/memberships/verify-membership-order', params);
  return response.data;
};


export const subscribeToMembership = async (params: any) => {
  const response = await api.post('/memberships/subscribe-to-membership', params);
  return response.data;
};


export const isAlreadySubscribed = async (params: any) => {
  const response = await api.post('/memberships/is-already-subscribed', params);
  return response.data;
};


export const getUserMemberships = async () => {
  const response = await api.get('/memberships/fetch-user-membership');
  return response.data;
};

export const cancelUserMembership = async (membershipId: string) => {
  const response = await api.post('/memberships/cancel-membership', { membershipId });
  return response.data;
};
