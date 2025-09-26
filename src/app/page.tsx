'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  role?: string;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwt.decode(token) as DecodedToken | null;
      
      // Check if decoded is an object and has optional role property
      if (decoded && typeof decoded === 'object') {
        if (decoded.role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (decoded.role === 'mandal') {
          router.replace('/mandal');
        } else {
          router.replace('/unauthorized');
        }
      } else {
        // Invalid token structure
        router.replace('/login');
      }
    } catch (err) {
      console.log("🚀 ~ Home ~ err:", err);
      router.replace('/login');
    }
  }, [router]);

  return null;
}