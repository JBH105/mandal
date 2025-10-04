import { createMemberData, getAllMonths, getMemberData } from "@/controllers/memberData.controller";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return await createMemberData(request);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.has("allMonths")) {
    return await getAllMonths(request);
  } else if (searchParams.has("month")) {
    return await getMemberData(request);
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}