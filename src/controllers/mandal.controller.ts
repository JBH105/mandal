// src/controllers/mandal.controller.ts

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

export async function updateMandalInstallment(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    await connectToDB();

    // 🟢 Helper to compare YYYY-MM correctly
    const monthToNumber = (m: string) => {
      const [y, mo] = m.split("-");
      return Number(y + mo.padStart(2, "0"));
    };

    // 🟢 Take body (NOT query)
    const { mandalId, selectedMonth, installment } = await request.json();

    if (!mandalId || !selectedMonth) {
      return NextResponse.json(
        { error: "Mandal ID and selected month required" },
        { status: 400 }
      );
    }

    const mandal = await Mandal.findById(mandalId);
    if (!mandal)
      return NextResponse.json({ error: "Mandal not found" }, { status: 404 });

    // 🟢 Save installment in Mandal
    mandal.setInstallment = installment;
    await mandal.save();

    // 🟢 Fetch all months of this mandal
    let months = await MemberData.distinct("month", { mandal: mandalId });

    const normalize = (m: string) => {
      const [y, mo] = m.split("-");
      return `${y}-${mo.padStart(2, "0")}`;
    };

    months = months.map(normalize);

    // 🟢 Sort months (newest first)
    months.sort((a, b) => b.localeCompare(a));

    const normalizedSelectedMonth = normalize(selectedMonth);
    const selectedNum = monthToNumber(normalizedSelectedMonth);

    // 🟢 FUTURE + CURRENT MONTHS ONLY
    const monthsToUpdate = months.filter(
      (m) => monthToNumber(m) >= selectedNum
    );

    // 🟢 PREVIOUS MONTHS (NEVER UPDATE)
    const monthsNotToUpdate = months.filter(
      (m) => monthToNumber(m) < selectedNum
    );

    // 🟢 Update only selected + future months
    const docs = await MemberData.find({
      mandal: mandalId,
      month: { $in: monthsToUpdate },
    });

    for (const doc of docs) {
      doc.installment = installment;
      doc.total = installment + (doc.interest || 0);
      await doc.save();
    }

    return NextResponse.json(
      {
        message: "Hapto updated successfully",
        setInstallment: installment,
        updatedMonths: monthsToUpdate,
        notUpdatedMonths: monthsNotToUpdate,
        updatedCount: docs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Installment update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
