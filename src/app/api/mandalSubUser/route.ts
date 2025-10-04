import { createMandalSubUser, getMandalSubUsers } from "@/controllers/mandalSubUser.controller";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return await createMandalSubUser(request);
}

export async function GET(request: Request) {
  return await getMandalSubUsers(request);
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
