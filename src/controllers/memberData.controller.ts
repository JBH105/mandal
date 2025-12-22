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
      _id,
      paidInstallment,   
      paidWithdrawal,
      newWithdrawal,
      fine,
    } = body;

    const current = await MemberData.findById(_id);
    if (!current)
      return NextResponse.json(
        { error: "Current month not found" },
        { status: 400 }
      );

    let remaining = paidInstallment;

    const installment = current.installment || 0;
    const pending = current.pendingInstallment || 0; 
    const interest = current.interest || 0;

    const paidCurrentInstallment = Math.min(remaining, installment);
    remaining -= paidCurrentInstallment;

   
    const paidInterest = Math.min(remaining, interest);
    remaining -= paidInterest;

    const unpaidInterest = interest - paidInterest; 

   
    const effectivePending = Math.max(0, pending - interest);

    const paidPending = Math.min(remaining, effectivePending);
    remaining -= paidPending;

    const basePending = Math.max(0, effectivePending - paidPending);

 
    const finalPendingInstallment = basePending + unpaidInterest;

    if (finalPendingInstallment < 0) {
      throw new Error("Invalid pending calculation");
    }

    
    current.paidInstallment = paidInstallment; 
    current.paidInterest = paidInterest;

    current.pendingInstallment = finalPendingInstallment;

    current.interest = 0;

    current.fine = fine || 0;
    current.newWithdrawal = newWithdrawal || 0;
    current.paidWithdrawal = paidWithdrawal || 0;

    await current.save();

    return NextResponse.json(
      {
        message: "Member data saved successfully",
        data: {
          paidInstallment,
          paidInterest,
          pendingInstallment: finalPendingInstallment,
        },
      },
      { status: 200 }
    );
} catch (error: unknown) {
  console.error(error);

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Server error" },
    { status: 500 }
  );
}
}

export async function getMemberData(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "mandal");
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;
    const mandal = await Mandal.findById(decoded?.id);
    if (!mandal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthId = searchParams.get("monthId");


    const memberData = await MemberData.find({
      mandal: mandal._id,
      monthId,
    }).populate("subUser", "subUserName phoneNumber");

    return NextResponse.json(memberData, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function setNewInstallment(request: AuthenticatedRequest) {
  try {
    await connectToDB();
    const body = await request.json();
    const authResult = await authMiddleware(request, "mandal");
    if (authResult) return authResult;

    const { decoded } = request;

    const mandal = await Mandal.findById(decoded?.id);
    const { monthId, installment } = body;

    const memberData = await MemberData.updateMany(
      {
        mandal: mandal._id,
        monthId,
      },
      {
        installment,
      }
    );
    return NextResponse.json(
      { message: "Month data initialized successfully", memberData },
      { status: 201 }
    );
  } catch (error) {
    console.log("🚀 ~ initializeMonthData ~ error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// export async function initializeMonthData(request: AuthenticatedRequest) {
//   try {
//     const authResult = await authMiddleware(request, "mandal");
//     if (authResult) return authResult;

//     await connectToDB();
//     const { decoded } = request;

//     const mandal = await Mandal.findById(decoded?.id);
//     if (!mandal)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await request.json();
//     const { month } = validateMonthInitialization(body);

//     const subUsers = await MandalSubUser.find({ mandal: mandal._id });

//     const allPreviousMonthsData = await MemberData.find({
//       mandal: mandal._id,
//       month: { $lt: month },
//     }).lean();

//     const installment = mandal.setInstallment || 0;

//     const memberDataPromises = subUsers.map(async (subUser) => {
//       const subUserId = subUser._id.toString();

//       const existingData = await MemberData.findOne({
//         mandal: mandal._id,
//         subUser: subUser._id,
//         month,
//       });
//       if (existingData) return existingData;

//       let totalPendingInstallment = 0;
//       const  totalPaidInstallment = 0;
//       let carriedForwardAmount = 0;

//       const userPreviousRecords = allPreviousMonthsData
//         .filter((d) => d.subUser.toString() === subUserId)
//         .sort((a, b) => a.month.localeCompare(b.month));

//       for (let i = userPreviousRecords.length - 1; i >= 0; i--) {
//         const prev = userPreviousRecords[i];

//         const paid = prev.paidInstallment || 0;
//         const expected = installment;

//         if (paid < expected) {
//           totalPendingInstallment += expected - paid;
//         } else {
//           break;
//         }

//         const balance =
//           (prev.amount || 0) +
//           (prev.newWithdrawal || 0) -
//           (prev.withdrawal || 0);

//         if (balance > 0) {
//           carriedForwardAmount += balance;
//         }
//       }

//       const amount = carriedForwardAmount > 0 ? carriedForwardAmount : 0;

//       const newMonthInstallment = totalPendingInstallment > 0 ? 0 : installment;

//       const newData = {
//         mandal: mandal._id,
//         subUser: subUser._id,
//         month,
//         installment: newMonthInstallment,
//         amount,
//         interest: 0,
//         fine: 0,
//         withdrawal: 0,
//         newWithdrawal: 0,
//         total: newMonthInstallment,
//         pendingInstallment: totalPendingInstallment,
//         paidInstallment: totalPaidInstallment,
//       };

//       const saved = new MemberData(newData);
//       await saved.save();
//       return saved;
//     });

//     const memberData = await Promise.all(memberDataPromises);

//     return NextResponse.json(
//       { message: "Month data initialized successfully", memberData },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log("🚀 ~ initializeMonthData ~ error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function getAllMonths(request: AuthenticatedRequest) {
//   try {
//     const authResult = await authMiddleware(request, "mandal");
//     if (authResult) return authResult;

//     await connectToDB();

//     const { decoded } = request;
//     const mandal = await Mandal.findById(decoded?.id);
//     if (!mandal) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     let months = await MemberData.distinct("month", { mandal: mandal._id });

//     // Normalize months → always YYYY-MM
//     const normalize = (m: string) => {
//       const [y, mo] = m.split("-");
//       return `${y}-${mo.padStart(2, "0")}`;
//     };

//     months = months.map(normalize);

//     // Sort newest first
//     months.sort((a, b) => b.localeCompare(a));

//     return NextResponse.json(months, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
