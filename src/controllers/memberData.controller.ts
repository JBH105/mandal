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
      if (!mandal)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      } = validateMemberDataCreation(body);

      const expected = mandal.setInstallment || 0;
      let remaining = installment;

      
      const current = await MemberData.findOne({
        mandal: mandal._id,
        subUser: subUserId,
        month,
      });

      if (!current)
        return NextResponse.json(
          { error: "Current month not found" },
          { status: 400 }
        );

      if (remaining >= expected) {
        remaining -= expected;
        current.outerCheckbox = true;
        current.pendingInstallment = 0;
      } else {
        current.outerCheckbox = false;
        current.pendingInstallment = expected - remaining;
        remaining = 0;
      }

      current.installment = installment;
      current.amount = amount;
      current.interest = interest;
      current.fine = fine;
      current.withdrawal = withdrawal;
      current.newWithdrawal = newWithdrawal;
      current.total = installment + interest;
      current.innerCheckbox = current.outerCheckbox;

      await current.save();

      if (remaining > 0) {
        const unpaidMonths = await MemberData.find({
          mandal: mandal._id,
          subUser: subUserId,
          outerCheckbox: false,
          month: { $lt: month },
        }).sort({ month: 1 }); 

        for (const m of unpaidMonths) {
          if (remaining <= 0) break;

          const due = expected;

          if (remaining >= due) {
            remaining -= due;
            m.pendingInstallment = 0;
            m.outerCheckbox = true;
          } else {
            m.pendingInstallment = expected - remaining;
            remaining = 0;
          }

          await m.save();
        }
      }

      return NextResponse.json(
        { message: "Member data saved successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("createMemberData error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    const subUsers = await MandalSubUser.find({ mandal: mandal._id });

    const allPreviousMonthsData = await MemberData.find({
      mandal: mandal._id,
      month: { $lt: month }, // only previous months
    }).lean();

    const installment = mandal.setInstallment || 0;

    const memberDataPromises = subUsers.map(async (subUser) => {
      const subUserId = subUser._id.toString();

      const existingData = await MemberData.findOne({
        mandal: mandal._id,
        subUser: subUser._id,
        month,
      });
      if (existingData) return existingData;

      let totalPendingInstallment = 0;
      let carriedForwardAmount = 0;

      const userPreviousRecords = allPreviousMonthsData
        .filter((d) => d.subUser.toString() === subUserId)
        .sort((a, b) => a.month.localeCompare(b.month));

      /* ========= FIXED LOGIC ========= */
      for (const prev of userPreviousRecords) {
        // ✅ pending is per-month only, based on checkbox
        if (prev.outerCheckbox === false) {
          totalPendingInstallment += installment; // NOT cumulative from DB
        }

        // amount carry forward (unchanged)
        const balance =
          (prev.amount || 0) +
          (prev.newWithdrawal || 0) -
          (prev.withdrawal || 0);

        if (balance > 0) {
          carriedForwardAmount += balance;
        }
      }
      /* ================================= */

      const amount = carriedForwardAmount > 0 ? carriedForwardAmount : 0;

      // if any pending exists, current month installment = 0
      const newMonthInstallment =
        totalPendingInstallment > 0 ? 0 : installment;

      const newData = {
        mandal: mandal._id,
        subUser: subUser._id,
        month,
        installment: newMonthInstallment,
        amount,
        interest: 0,
        fine: 0,
        withdrawal: 0,
        newWithdrawal: 0,
        total: newMonthInstallment,
        pendingInstallment: totalPendingInstallment, // sum of per-month pendings
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