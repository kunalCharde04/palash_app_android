import { useState, useEffect, useCallback } from 'react';
import { fetchMembershipPlans, getUserMemberships } from '@/api/membership';

interface MembershipPlan {
    id: string;
    name: string;
    durationYears: number;
    maxMembers: number;
    renewalPeriodYears: number;
    discountClubActivities: number;
    discountDining: number;
    discountAccommodations: number;
    discountSpaActivities: number;
    discountMedicalWellness: number;
    referenceBenefits: number;
    guestDiscount: number;
    includesYogaGuidance: boolean;
    includesDietChartFor: number;
    includesDoctorConsultation: boolean;
    panchkarmaWorth: number;
    cost: number;
    createdAt: string;
}

interface UserMembership {
    id: string;
    userId: string;
    planId: string;
    startDate: string;
    endDate: string;
    isPrimary: boolean;
    isActive: boolean;
    parentMembershipId: string | null;
    createdAt: string;
    plan: MembershipPlan;
    user: {
        id: string;
        name: string;
        phone_or_email: string;
    };
}

interface UserMembershipsResponse {
    message: string;
    activeMemberships: UserMembership[];
    inactiveMemberships: UserMembership[];
}

interface UseMembershipsReturn {
    membershipPlans: MembershipPlan[];
    userMemberships: UserMembershipsResponse;
    loading: boolean;
    membershipsLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    setUserMemberships: React.Dispatch<React.SetStateAction<UserMembershipsResponse>>;
}

export const useMemberships = (): UseMembershipsReturn => {
    const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
    const [userMemberships, setUserMemberships] = useState<UserMembershipsResponse>({
        message: '',
        activeMemberships: [],
        inactiveMemberships: []
    });
    const [loading, setLoading] = useState(true);
    const [membershipsLoading, setMembershipsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setError(null);
        
        // Load membership plans
        try {
            setLoading(true);
            const response = await fetchMembershipPlans();
            setMembershipPlans(response.membershipPlans);
        } catch (error) {
            console.error('Error fetching membership plans:', error);
            setError('Failed to load membership plans');
        } finally {
            setLoading(false);
        }

        // Load user memberships
        try {
            setMembershipsLoading(true);
            const userMembershipsResponse = await getUserMemberships();
            setUserMemberships(userMembershipsResponse);
        } catch (error) {
            console.error('Error fetching user memberships:', error);
            setError('Failed to load your memberships');
        } finally {
            setMembershipsLoading(false);
        }
    }, []);

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        membershipPlans,
        userMemberships,
        loading,
        membershipsLoading,
        error,
        refetch,
        setUserMemberships
    };
}; 