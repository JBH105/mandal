// src\controllers\memberData.controller.ts
import { connectToDB } from "@/config/db";
import MemberData from "@/model/MemberData";
import Mandal from "@/model/Mandal";
import MandalSubUser from "@/model/MandalSubUser";
import { NextResponse } from "next/server";
import {
  validateMemberDataCreation,
  validateMonthInitialization,
} from "@/utils/validation";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";

const getPreviousMonth = (month: string): string => {
  const [yearStr, monthStr] = month.split("-");
  let year = parseInt(yearStr);
  let mon = parseInt(monthStr);
  mon -= 1;
  if (mon === 0) {
    mon = 12;
    year -= 1;
  }
  return `${year}-${mon.toString().padStart(2, "0")}`;
};

export async function createMemberData(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "mandal");
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;
    const mandal = await Mandal.findById(decoded?.id);
    if (!mandal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      subUserId,
      month,
      installment,
      amount,
      interest,
      fine,
      withdrawal,
      newWithdrawal,
      pendingInstallment
    } = validateMemberDataCreation(body);

    const innerChecked = body.innerCheckbox === true;   
    const outerChecked = innerChecked;

    const existing = await MemberData.findOne({
      mandal: mandal._id,
      subUser: subUserId,
      month,
    });

    if (existing) {
      if (innerChecked) {
        existing.installment = installment;
        existing.outerCheckbox = true;
      } else {
        existing.installment = 0;
        existing.outerCheckbox = false;
      }

      existing.amount = amount;
      existing.interest = interest;
      existing.fine = fine;
      existing.withdrawal = withdrawal;
      existing.newWithdrawal = newWithdrawal;
      existing.total = existing.installment + existing.interest;
      existing.innerCheckbox = innerChecked;
      existing.pendingInstallment = pendingInstallment

      await existing.save();
      return NextResponse.json({ message: "Member data updated" }, { status: 200 });
    }

    const actualInstallment = innerChecked ? installment : 0;

    const newRecord = new MemberData({
      mandal: mandal._id,
      subUser: subUserId,
      month,
      installment: actualInstallment,
      amount,
      interest,
      fine,
      withdrawal,
      newWithdrawal,
      total: actualInstallment + interest,
      outerCheckbox: outerChecked,  
      innerCheckbox: innerChecked,
      pendingInstallment   
    });

    await newRecord.save();

  } catch (error) {
    console.error("createMemberData error:", error);
    return NextResponse.json({ error: "Server error" }, { status:500 });
  }
}

export async function getMemberData(request: AuthenticatedRequest) {
  try {
    // Apply auth middleware (mandal role required)
    const authResult = await authMiddleware(request, "mandal");
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
      return NextResponse.json(
        { error: "Month is required in YYYY-MM format" },
        { status: 400 }
      );
    }

    const memberData = await MemberData.find({
      mandal: mandal._id,
      month,
    }).populate("subUser", "subUserName phoneNumber");

    return NextResponse.json(memberData, { status: 200 });
  } catch (error: unknown) {
    console.log("🚀 ~ getMemberData ~ error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function initializeMonthData(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "mandal");
    if (authResult) return authResult;

    await connectToDB();
    const { decoded } = request;

    const mandal = await Mandal.findById(decoded?.id);
    if (!mandal)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { month } = validateMonthInitialization(body);

    const prevMonth = getPreviousMonth(month);

    const subUsers = await MandalSubUser.find({ mandal: mandal._id });

    const prevData = await MemberData.find({
      mandal: mandal._id,
      month: prevMonth,
    });

    const prevDataMap = new Map(prevData.map((d) => [d.subUser.toString(), d]));

    const memberDataPromises = subUsers.map(async (subUser) => {
      const subUserId = subUser._id.toString();

      const existingData = await MemberData.findOne({
        mandal: mandal._id,
        subUser: subUser._id,
        month,
      });

      if (existingData) return existingData;

      const installment = mandal.setInstallment || 0;
      let amount = 0;
      let pendingInstallment = 0;

      const prev = prevDataMap.get(subUserId);

      if (prev) {
        const carriedForwardAmount =
          (prev.amount || 0) + (prev.newWithdrawal || 0) - (prev.withdrawal || 0);
        amount = carriedForwardAmount > 0 ? carriedForwardAmount : 0;
        
        if (prev.outerCheckbox === false) {
          pendingInstallment = prev.installment || 0;
        } else if (prev.outerCheckbox === true) {
          const paidAmount = prev.total || 0; 
          const expectedAmount = installment || 0;
          
          if (paidAmount < expectedAmount) {
            pendingInstallment = expectedAmount - paidAmount;
          }
        }
      }

      const newData = {
        mandal: mandal._id,
        subUser: subUser._id,
        month,
        installment,
        amount, 
        interest: 0,
        fine: 0,
        withdrawal: 0,
        newWithdrawal: 0,
        total: installment,          
        pendingInstallment: pendingInstallment,
        outerCheckbox: false,
        innerCheckbox: false,
      };

      const saved = new MemberData(newData);
      await saved.save();
      return saved;
    });

    const memberData = await Promise.all(memberDataPromises);

    return NextResponse.json(
      { message: "Month data initialized successfully", memberData },
      { status: 201 }
    );

  } catch (error) {
    console.log("🚀 ~ initializeMonthData ~ error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getAllMonths(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "mandal");
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}