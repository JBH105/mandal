// src\controllers\mandal.controller.ts

import { connectToDB } from "@/config/db";
import Mandal from "@/model/Mandal";
import { NextResponse } from "next/server";
import { validateMandalCreation } from "@/utils/validation";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/authMiddleware";
import MemberData from "@/model/MemberData";
import MandalSubUser from "@/model/MandalSubUser";

export async function createMandal(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (admin role required)
    const authResult = await authMiddleware(request, 'admin');
    if (authResult) return authResult;

    await connectToDB();

    const body = await request.json();
    // Validate input
    const {
      nameEn,
      nameGu,
      userName,
      phoneNumber,
      password,
      establishedDate,
      isActive
    } = validateMandalCreation(body);

    const existingMandal = await Mandal.findOne({ phoneNumber });
    if (existingMandal) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
    }

    const mandal = new Mandal({
      nameEn,
      nameGu,
      userName,
      phoneNumber,
      password,
      establishedDate: new Date(establishedDate),
      isActive: isActive !== undefined ? isActive : true,
    });

    await mandal.save();

    return NextResponse.json({ message: "Mandal created successfully" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating mandal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function getMandals(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (admin or mandal role)
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;

    // If user is a mandal, return only their own mandal data
    if (decoded?.role === 'mandal') {
      const mandalData = await Mandal.findById(decoded.id, "-password");
      return NextResponse.json([mandalData], { status: 200 });
    }

    // If user is an admin, return all mandals (exclude password)
    const mandals = await Mandal.find({}, "-password");

    return NextResponse.json(mandals, { status: 200 });
  } catch (error: unknown) {
    console.log("🚀 ~ getMandals ~ error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function updateMandal(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (admin role required)
    const authResult = await authMiddleware(request, 'admin');
    if (authResult) return authResult;

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Mandal ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { nameEn, nameGu, userName, isActive } = body;

    // Validate input
    if (!nameEn || !nameGu || !userName) {
      return NextResponse.json({ error: "nameEn, nameGu, and userName are required" }, { status: 400 });
    }

    const mandal = await Mandal.findById(id);
    if (!mandal) {
      return NextResponse.json({ error: "Mandal not found" }, { status: 404 });
    }

    // Update only allowed fields
    mandal.nameEn = nameEn;
    mandal.nameGu = nameGu;
    mandal.userName = userName;
    mandal.isActive = isActive !== undefined ? isActive : mandal.isActive;

    await mandal.save();

    return NextResponse.json({ message: "Mandal updated successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.log("🚀 ~ updateMandal ~ error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function deleteMandal(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (admin role required)
    const authResult = await authMiddleware(request, 'admin');
    if (authResult) return authResult;

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Mandal ID is required" }, { status: 400 });
    }

    const mandal = await Mandal.findById(id);
    if (!mandal) {
      return NextResponse.json({ error: "Mandal not found" }, { status: 404 });
    }

    // Delete related data
    await MemberData.deleteMany({ mandal: id });
    await MandalSubUser.deleteMany({ mandal: id });

    // Delete the mandal
    await Mandal.findByIdAndDelete(id);

    return NextResponse.json({ message: "Mandal and related data deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.log("🚀 ~ deleteMandal ~ error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}