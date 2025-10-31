import axios from 'axios';
import { Deployment, CreateDeploymentRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deploymentApi = {
  create: async (data: CreateDeploymentRequest): Promise<Deployment> => {
    const response = await api.post<Deployment>('/api/deployments', data);
    return response.data;
  },

  getByUser: async (userWalletAddress: string): Promise<Deployment[]> => {
    const response = await api.get<Deployment[]>('/api/deployments', {
      params: { userWalletAddress },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Deployment> => {
    const response = await api.get<Deployment>(`/api/deployments/${id}`);
    return response.data;
  },

  getAll: async (): Promise<Deployment[]> => {
    const response = await api.get<Deployment[]>('/api/deployments');
    return response.data;
  },
};

export default api;

