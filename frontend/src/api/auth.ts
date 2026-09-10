import { apiClient } from './client';
import type { AuthResponse, User } from '../types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const response = await apiClient.post<AuthResponse>('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const registerApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    password,
  });
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
