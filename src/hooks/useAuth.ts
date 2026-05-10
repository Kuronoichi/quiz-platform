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
        const response = await apiClient.get('/api/auth/session');
        if (response.data?.user) {
          setUser(response.data.user as User);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchUser();
  }, []);

  const isCreator = user?.role_id === 'creator' || String(user?.role_id) === '1';
  const isParticipant = user?.role_id === 'participant' || String(user?.role_id) === '2';
  const isModerator = user?.role_id === 'moderator' || user?.role_id === 'admin';
  const isAdmin = user?.role_id === 'admin';

  return { user, loading, isCreator, isParticipant, isModerator, isAdmin };
};
