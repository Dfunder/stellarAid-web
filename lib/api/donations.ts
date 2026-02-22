import { apiClient } from './interceptors';
import { Donation, ApiResponse, CreateDonationRequest } from '@/types/api';

export const donationsApi = {
    getDonations: async (projectId?: string): Promise<ApiResponse<Donation[]>> => {
        const url = projectId ? `/donations?projectId=${projectId}` : '/donations';
        const response = await apiClient.get<ApiResponse<Donation[]>>(url);
        return response.data;
    },

    createDonation: async (data: CreateDonationRequest): Promise<ApiResponse<Donation>> => {
        const response = await apiClient.post<ApiResponse<Donation>>('/donations', data);
        return response.data;
    },

    getUserDonations: async (): Promise<ApiResponse<Donation[]>> => {
        const response = await apiClient.get<ApiResponse<Donation[]>>('/donations/user');
        return response.data;
    },
};
