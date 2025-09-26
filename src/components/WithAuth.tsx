'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

// const SECRET = 'your-secret-key'; // Same as in your API route

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

// Define the JWT payload structure
interface JwtPayload {
  role: string;
  // Add other expected properties from your JWT token if needed
  exp?: number;
  iat?: number;
  // ... other standard JWT claims
}

export default function WithAuth({ allowedRoles, children }: Props) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Not logged in → redirect to login
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwt.decode(token) as JwtPayload | null;

      if (!decoded || !decoded.role) {
        router.replace('/login');
        return;
      }

      if (!allowedRoles.includes(decoded.role)) {
        // Role not allowed → unauthorized
        router.replace('/unauthorized');
        return;
      }

      // Authorized
      setAuthorized(true);
    } catch (error) {
      console.log("🚀 ~ WithAuth ~ error:", error)
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [allowedRoles, router]);

  if (loading) return null; // Or show a spinner

  return authorized ? <>{children}</> : null;
}