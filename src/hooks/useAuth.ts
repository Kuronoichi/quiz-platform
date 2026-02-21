import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  full_name: string;
  role_id: string;
  active: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Better Auth endpoint для получения текущего пользователя
        const baseURL = process.env.REACT_APP_API_URL ?? '';
        const url = baseURL ? `${baseURL}/api/auth/session` : '/api/auth/session';
        const response = await apiClient.get(url);
        if (response.data?.user) {
          setUser(response.data.user as User);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { user, loading, isCreator: user?.role_id === 'creator', isParticipant: user?.role_id === 'participant' };
};
