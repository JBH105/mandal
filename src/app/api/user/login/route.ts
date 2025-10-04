import { login } from "@/controllers/admin.controller";
import { NextResponse } from "next/server";

// Handle POST requests
export async function POST(request: Request) {
  return await login(request);
}

// Optional: Restrict other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}