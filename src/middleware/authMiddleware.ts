// src\middleware\authMiddleware.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Admin, { IAdmin } from '@/model/Admin';
import Mandal, { IMandal } from '@/model/Mandal';
import { connectToDB } from '@/config/db';
import { Document } from 'mongoose';

export interface DecodedToken {
  id: string;
  phoneNumber: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: Document & (IAdmin | IMandal);
  decoded?: DecodedToken;
}

export async function authMiddleware(request: Request, requiredRole?: string) {
  try {
    await connectToDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1]; 
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Token expired, please log in again' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify user based on role
    let user = null;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'mandal') {
      user = await Mandal.findById(decoded.id);
    } else {
      user = await Admin.findById(decoded.id) || await Mandal.findById(decoded.id);
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Check if required role matches
    if (requiredRole && decoded.role !== requiredRole) {
      return NextResponse.json({ error: `Unauthorized: ${requiredRole} role required` }, { status: 401 });
    }

    // Attach user and decoded token to request for downstream use
    (request as AuthenticatedRequest).user = user;
    (request as AuthenticatedRequest).decoded = decoded;

    return null; // Indicates successful authentication, proceed to next handler
  } catch (error: unknown) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}