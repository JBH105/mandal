// src\controllers\mandalSubUser.controller.ts
import { connectToDB } from "@/config/db";
import MandalSubUser from "@/model/MandalSubUser";
import Mandal from "@/model/Mandal";
import { NextResponse } from "next/server";
import { validateMandalSubUserCreation } from "@/utils/validation";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/authMiddleware";

// Create Sub-user
export async function createMandalSubUser(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (mandal role required)
    const authResult = await authMiddleware(request, 'mandal');
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;
    const mandal = await Mandal.findById(decoded?.id);
    if (!mandal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Validate input
    const { subUserName, phoneNumber } = validateMandalSubUserCreation(body);

    const existingSubUser = await MandalSubUser.findOne({ phoneNumber });
    if (existingSubUser) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
    }

    const subUser = new MandalSubUser({
      mandal: mandal._id,
      subUserName,
      phoneNumber,
    });

    await subUser.save();

    return NextResponse.json({ message: "Sub-user created successfully" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating sub-user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get all Sub-users
export async function getMandalSubUsers(request: AuthenticatedRequest) {
  try {
    // Auth for both roles
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;

    let subUsers;

    if (decoded?.role === 'mandal') {
      // Mandal user → only their sub-users
      subUsers = await MandalSubUser.find({ mandal: decoded.id });
    } else if (decoded?.role === 'admin') {
      // Admin → get ALL sub-users across all mandals
      subUsers = await MandalSubUser.find().populate("mandal"); 
      // (populate ensures mandal info is there for frontend matching)
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(subUsers, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching sub-users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}