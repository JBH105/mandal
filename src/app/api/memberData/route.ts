
import { createMemberData  } from "@/controllers/memberData.controller";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return await createMemberData(request);
}


export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}