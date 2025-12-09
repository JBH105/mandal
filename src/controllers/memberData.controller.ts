// src\controllers\memberData.controller.ts
import { connectToDB } from "@/config/db";
import MemberData from "@/model/MemberData";
import Mandal from "@/model/Mandal";
import MandalSubUser from "@/model/MandalSubUser";
import { NextResponse } from "next/server";
import { validateMemberDataCreation, validateMonthInitialization } from "@/utils/validation";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/authMiddleware";

const getPreviousMonth = (month: string): string => {
  const [yearStr, monthStr] = month.split('-');
  let year = parseInt(yearStr);
  let mon = parseInt(monthStr);
  mon -= 1;
  if (mon === 0) {
    mon = 12;
    year -= 1;
  }
  return `${year}-${mon.toString().padStart(2, '0')}`;
};

export async function createMemberData(request: AuthenticatedRequest) {
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
    const {
      subUserId,
      month,
      installment,
      amount,
      interest,
      fine,
      withdrawal,
      newWithdrawal,
    } = validateMemberDataCreation(body);

    const total = installment + interest;

    const existingData = await MemberData.findOne({
      mandal: mandal._id,
      subUser: subUserId,
      month,
    });

    if (existingData) {
      // Update existing data
      existingData.installment = installment;
      existingData.amount = amount;
      existingData.interest = interest;
      existingData.fine = fine;
      existingData.withdrawal = withdrawal;
      existingData.newWithdrawal = newWithdrawal;
      existingData.total = total;
      await existingData.save();
      return NextResponse.json({ message: "Member data updated successfully" }, { status: 200 });
    }

    const memberData = new MemberData({
      mandal: mandal._id,
      subUser: subUserId,
      month,
      installment,
      amount,
      interest,
      fine,
      withdrawal,
      newWithdrawal,
      total,
    });

    await memberData.save();

    return NextResponse.json({ message: "Member data created successfully" }, { status: 201 });
  } catch (error: unknown) {
    console.log("🚀 ~ createMemberData ~ error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function getMemberData(request: AuthenticatedRequest) {
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

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Month is required in YYYY-MM format" }, { status: 400 });
    }

    const memberData = await MemberData.find({ mandal: mandal._id, month }).populate(
      "subUser",
      "subUserName phoneNumber"
    );

    return NextResponse.json(memberData, { status: 200 });
  } catch (error: unknown) {
    console.log("🚀 ~ getMemberData ~ error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function initializeMonthData(request: AuthenticatedRequest) {
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
    const { month } = validateMonthInitialization(body);

    const prevMonth = getPreviousMonth(month);

    // Fetch all sub-users for the mandal
    const subUsers = await MandalSubUser.find({ mandal: mandal._id });

    // Fetch previous month data
    const prevData = await MemberData.find({ mandal: mandal._id, month: prevMonth });
    const prevDataMap = new Map(prevData.map(d => [d.subUser.toString(), d]));

    // Initialize member data for each sub-user, copying from previous month if available
    const memberDataPromises = subUsers.map(async (subUser) => {
      const subUserId = subUser._id.toString();

      const existingData = await MemberData.findOne({
        mandal: mandal._id,
        subUser: subUser._id,
        month,
      });

      if (existingData) {
        return existingData;
      }

      let newData = {
        mandal: mandal._id,
        subUser: subUser._id,
        month,
        installment: 0,
        amount: 0,
        interest: 0,
        fine: 0,
        withdrawal: 0,
        newWithdrawal: 0,
        total: 0,
      };

      const prev = prevDataMap.get(subUserId);
      if (prev) {
        newData = {
          ...newData,
          installment: prev.installment,
          amount: prev.amount + prev.newWithdrawal,
          interest: 0,
          fine: 0,
          withdrawal: 0,
          newWithdrawal: 0,
          total: prev.installment + 0,
        };
      }

      const memberData = new MemberData(newData);
      await memberData.save();
      return memberData;
    });

    const memberData = await Promise.all(memberDataPromises);

    return NextResponse.json(
      { message: "Month data initialized successfully", memberData },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.log("🚀 ~ initializeMonthData ~ error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function getAllMonths(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, 'mandal');
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;
    const mandal = await Mandal.findById(decoded?.id);
    if (!mandal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let months = await MemberData.distinct("month", { mandal: mandal._id });

    // Normalize months → always YYYY-MM
    const normalize = (m: string) => {
      const [y, mo] = m.split("-");
      return `${y}-${mo.padStart(2, "0")}`;
    };

    months = months.map(normalize);

    // Sort newest first
    months.sort((a, b) => b.localeCompare(a));

    return NextResponse.json(months, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ getAllMonths ~ error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
