// src/controllers/mandal.controller.ts

import { connectToDB } from "@/config/db";
import Mandal from "@/model/Mandal";
import { NextResponse } from "next/server";
import { validateMandalCreation } from "@/utils/validation";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import MemberData from "@/model/MemberData";
import MandalSubUser from "@/model/MandalSubUser";
import mongoose from "mongoose";
import MandalMonth from "@/model/MandalMonth";

export async function createMandal(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "admin");
    if (authResult) return authResult;

    await connectToDB();

    const body = await request.json();
    const {
      nameEn,
      nameGu,
      userName,
      phoneNumber,
      password,
      establishedDate,
      isActive,
    } = validateMandalCreation(body);

    const existingMandal = await Mandal.findOne({ phoneNumber });
    if (existingMandal) {
      return NextResponse.json(
        { error: "Phone number already in use" },
        { status: 400 }
      );
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

    const d = new Date(mandal.establishedDate);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");

    const result = `${year}-${month}`;
    const monthBody = {
      mandal: mandal._id,
      month: result,
      monthlyInstallment: 0,
    };

    MandalMonth.create(monthBody);

    return NextResponse.json(
      { message: "Mandal created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating mandal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    if (decoded?.role === "mandal") {
      const mandalData = await Mandal.findById(decoded.id, "-password");
      return NextResponse.json([mandalData], { status: 200 });
    }

    // If user is an admin, return all mandals (exclude password)
    const mandals = await Mandal.find({}, "-password");

    return NextResponse.json(mandals, { status: 200 });
  } catch (error: unknown) {
    console.log("🚀 ~ getMandals ~ error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateMandal(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (admin role required)
    const authResult = await authMiddleware(request, "admin");
    if (authResult) return authResult;

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Mandal ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nameEn, nameGu, userName, isActive } = body;

    // Validate input
    if (!nameEn || !nameGu || !userName) {
      return NextResponse.json(
        { error: "nameEn, nameGu, and userName are required" },
        { status: 400 }
      );
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

    return NextResponse.json(
      { message: "Mandal updated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log("🚀 ~ updateMandal ~ error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function deleteMandal(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "admin");
    if (authResult) return authResult;

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Mandal ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Mandal ID format" },
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const mandal = await Mandal.findById(objectId);
    if (!mandal) {
      return NextResponse.json({ error: "Mandal not found" }, { status: 404 });
    }

    const memberDeleteResult = await MemberData.deleteMany({
      mandal: objectId,
    });
    const subUserDeleteResult = await MandalSubUser.deleteMany({
      mandal: objectId,
    });

    console.log("Deleted MemberData count:", memberDeleteResult.deletedCount);
    console.log(
      "Deleted MandalSubUser count:",
      subUserDeleteResult.deletedCount
    );

    await Mandal.findByIdAndDelete(objectId);

    return NextResponse.json(
      {
        message: "Mandal and all related data deleted successfully",
        details: {
          deletedMembers: memberDeleteResult.deletedCount,
          deletedSubUsers: subUserDeleteResult.deletedCount,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("deleteMandal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

