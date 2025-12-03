// hooks/useMandalUser.ts
import { useState, useEffect } from 'react';
import { getMandals } from '@/auth/auth';

export interface MandalUser {
  userName: string;
  phoneNumber: string;
  mandalName: string;
  mandalNameGujarati: string;
}

export const useMandalUser = () => {
  const [mandalUser, setMandalUser] = useState<MandalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMandalUser = async () => {
      try {
        setIsLoading(true);
        const mandals = await getMandals();
        
        if (mandals.length > 0) {
          const mandal = mandals[0];
          setMandalUser({
            userName: mandal.userName || 'Mandal User',
            phoneNumber: mandal.phoneNumber || 'Not provided',
            mandalName: mandal.nameEn || 'Mandal',
            mandalNameGujarati: mandal.nameGu || 'મંડળ',
          });
        }
      } catch (err) {
        console.error('Error fetching mandal user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMandalUser();
  }, []);

  return {
    mandalUser,
    isLoading
  };
};