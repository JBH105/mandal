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
import MandalMonth from "@/model/MandalMonth";

// export async function createMemberData(request: AuthenticatedRequest) {
//   try {
//     const authResult = await authMiddleware(request, "mandal");
//     if (authResult) return authResult;

//     await connectToDB();

//     const { decoded } = request;
//     const mandal = await Mandal.findById(decoded?.id);
//     if (!mandal)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await request.json();
//     const {
//       _id,
//       paidInstallment,   
//       paidWithdrawal,
//       newWithdrawal,
//       fine,
//     } = body;

//     const current = await MemberData.findById(_id);
//     if (!current)
//       return NextResponse.json(
//         { error: "Current month not found" },
//         { status: 400 }
//       );

//     let remaining = paidInstallment;

//     const installment = current.installment || 0;
//     const pending = current.pendingInstallment || 0; 
//     const interest = current.interest || 0;

//     const paidCurrentInstallment = Math.min(remaining, installment);
//     remaining -= paidCurrentInstallment;

   
//     const paidInterest = Math.min(remaining, interest);
//     remaining -= paidInterest;

//     const unpaidInterest = interest - paidInterest; 

   
//     const effectivePending = Math.max(0, pending - interest);

//     const paidPending = Math.min(remaining, effectivePending);
//     remaining -= paidPending;

//     const basePending = Math.max(0, effectivePending - paidPending);

 
//     const finalPendingInstallment = basePending + unpaidInterest;

//     if (finalPendingInstallment < 0) {
//       throw new Error("Invalid pending calculation");
//     }

    
//     current.paidInstallment = paidInstallment; 
//     current.paidInterest = paidInterest;

//     current.pendingInstallment = finalPendingInstallment;

//     current.interest = 0;

//     current.fine = fine || 0;
//     current.newWithdrawal = newWithdrawal || 0;
//     current.paidWithdrawal = paidWithdrawal || 0;

//     await current.save();

//     return NextResponse.json(
//       {
//         message: "Member data saved successfully",
//         data: {
//           paidInstallment,
//           paidInterest,
//           pendingInstallment: finalPendingInstallment,
//         },
//       },
//       { status: 200 }
//     );
// } catch (error: unknown) {
//   console.error(error);

//   if (error instanceof Error) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }

//   return NextResponse.json(
//     { error: "Server error" },
//     { status: 500 }
//   );
// }
// }

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
      _id,
      paidInstallment = 0,
      paidInterest = 0,
      paidWithdrawal = 0,
      newWithdrawal = 0,
      fine = 0,
    } = body;

    const current = await MemberData.findById(_id);
    if (!current) {
      return NextResponse.json(
        { error: "Current month not found" },
        { status: 400 }
      );
    }

    const isFirstTimePayment =
      (current.paidInstallment || 0) === 0 &&
      (current.paidInterest || 0) === 0;

   
    if (isFirstTimePayment) {

      const currentInstallment = current.installment || 0;
      const currentPendingInstallment = current.pendingInstallment || 0;
      const paidInstallmentNumber = Number(paidInstallment) || 0;

      if (paidInstallmentNumber > 0) {
        if (paidInstallmentNumber >= currentInstallment) {
          current.installment = 0;

          const extraPaid =
            paidInstallmentNumber - currentInstallment;

          current.pendingInstallment = Math.max(
            0,
            currentPendingInstallment - extraPaid
          );

          current.paidInstallment = paidInstallmentNumber;
        } else {
          current.installment =
            currentInstallment - paidInstallmentNumber;

          current.pendingInstallment = currentPendingInstallment;
          current.paidInstallment = paidInstallmentNumber;
        }
      }


      const currentInterest = current.interest || 0;
      const currentPendingInterest = current.pendingInterest || 0;
      const paidInterestNumber = Number(paidInterest) || 0;

      if (paidInterestNumber > 0) {
        if (paidInterestNumber >= currentInterest) {
          current.interest = 0;

          const extraInterestPaid =
            paidInterestNumber - currentInterest;

          current.pendingInterest = Math.max(
            0,
            currentPendingInterest - extraInterestPaid
          );

          current.paidInterest = paidInterestNumber;
        } else {
          current.interest =
            currentInterest - paidInterestNumber;

          current.pendingInterest = currentPendingInterest;
          current.paidInterest = paidInterestNumber;
        }
      }
    }


    current.paidWithdrawal = Number(paidWithdrawal) || 0;
    current.newWithdrawal = Number(newWithdrawal) || 0;
    current.fine = Number(fine) || 0;

    await current.save();

    return NextResponse.json(
      {
        message: "Member data saved successfully",
        data: {
          installment: current.installment,
          pendingInstallment: current.pendingInstallment,
          paidInstallment: current.paidInstallment,

          interest: current.interest,
          pendingInterest: current.pendingInterest,
          paidInterest: current.paidInterest,
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

// export async function setNewInstallment(request: AuthenticatedRequest) {
//   try {
//     await connectToDB();
//     const body = await request.json();
//     const authResult = await authMiddleware(request, "mandal");
//     if (authResult) return authResult;

//     const { decoded } = request;

//     const mandal = await Mandal.findById(decoded?.id);
//     const { monthId, installment } = body;

//     const memberData = await MemberData.updateMany(
//       {
//         mandal: mandal._id,
//         monthId,
//       },
//       {
//         installment,
//       }
//     );
//     return NextResponse.json(
//       { message: "Month data initialized successfully", memberData },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log("🚀 ~ initializeMonthData ~ error:", error);
//     return NextResponse.json({ error }, { status: 500 });
//   }
// }

export async function setNewInstallment(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request, "mandal");
    if (authResult) return authResult;

    await connectToDB();

    const body = await request.json();
    const { monthId, installment } = body;

    if (!monthId) {
      return NextResponse.json(
        { error: "monthId is required" },
        { status: 400 }
      );
    }

    if (typeof installment !== "number" || installment < 0) {
      return NextResponse.json(
        { error: "Valid installment is required" },
        { status: 400 }
      );
    }

    const mandalId = request.decoded!.id;

    const updatedMonth = await MandalMonth.findOneAndUpdate(
      { _id: monthId, mandal: mandalId },
      { monthlyInstallment: installment },
      { new: true }
    );

    if (!updatedMonth) {
      return NextResponse.json(
        { error: "Month not found" },
        { status: 404 }
      );
    }

    await MemberData.updateMany(
      {
        mandal: mandalId,
        monthId,
        paidInstallment: 0,
        paidInterest: 0,
      },
      {
        installment,
      }
    );

    return NextResponse.json(
      {
        message: "Monthly installment updated successfully",
        month: updatedMonth.month,
        monthlyInstallment: updatedMonth.monthlyInstallment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("setNewInstallment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

