import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  // Dummy users
  const users = [
    { id: 1, email: "admin@example.com", password: "admin", role: "admin" },
    { id: 2, email: "mandal@example.com", password: "mandal", role: "mandal" },
  ];

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
const role= user.role
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ token,role });
}
