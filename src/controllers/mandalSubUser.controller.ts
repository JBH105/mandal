// src\controllers\mandalSubUser.controller.ts
import { connectToDB } from "@/config/db";
import MandalSubUser from "@/model/MandalSubUser";
import Mandal from "@/model/Mandal";
import { NextResponse } from "next/server";
import { validateMandalSubUserCreation } from "@/utils/validation";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import MemberData from "@/model/MemberData";
import MandalMonth from "@/model/MandalMonth";

// Create Sub-user
// export async function createMandalSubUser(request: AuthenticatedRequest) {
//   try {
//     const authResult = await authMiddleware(request, "mandal");
//     if (authResult) return authResult;

//     await connectToDB();

//     const { decoded } = request;
//     const mandal = await Mandal.findById(decoded?.id);
//     if (!mandal) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const { subUserName, phoneNumber, monthId } =
//       validateMandalSubUserCreation(body);

//     const existingSubUser = await MandalSubUser.findOne({ phoneNumber });
//     if (existingSubUser) {
//       return NextResponse.json(
//         { error: "Phone number already in use" },
//         { status: 400 }
//       );
//     }

//     const subUser = await MandalSubUser.create({
//       mandal: mandal._id,
//       subUserName,
//       phoneNumber,
//     });

//     const month = await MandalMonth.findOne({
//       _id: monthId,
//       mandal: mandal._id,
//     });

//     if (!month) {
//       return NextResponse.json(
//         { error: "Invalid month" },
//         { status: 400 }
//       );
//     }

//     const memberData = await MemberData.create({
//       mandal: mandal._id,
//       subUser: subUser._id,
//       monthId: month._id,

//       installment: month.monthlyInstallment,
//       pendingInstallment: 0,
//       paidInstallment: 0,

//       interest: 0,
//       pendingInterest: 0,
//       paidInterest: 0,

//       withdrawal: 0,
//       newWithdrawal: 0,
//       paidWithdrawal: 0,

//       fine: 0,
//       total: 0,
//     });

//     return NextResponse.json(
//       {
//         message: "Sub-user created successfully",
//         data: memberData,
//       },
//       { status: 201 }
//     );
//   } catch (error: unknown) {
//     console.error("Error creating sub-user:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// Create Sub-user
export async function createMandalSubUser(request: AuthenticatedRequest) {
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
    const { subUserName, phoneNumber, monthId } =
      validateMandalSubUserCreation(body);

    // 🔁 check duplicate phone
    const existingSubUser = await MandalSubUser.findOne({ phoneNumber });
    if (existingSubUser) {
      return NextResponse.json(
        { error: "Phone number already in use" },
        { status: 400 }
      );
    }

    const subUser = await MandalSubUser.create({
      mandal: mandal._id,
      subUserName,
      phoneNumber,
    });

    const currentMonth = await MandalMonth.findOne({
      _id: monthId,
      mandal: mandal._id,
    });

    if (!currentMonth) {
      return NextResponse.json(
        { error: "Invalid month" },
        { status: 400 }
      );
    }


    const previousMonths = await MandalMonth.find({
      mandal: mandal._id,
      month: { $lt: currentMonth.month },
    });

    const pendingInstallment = previousMonths.reduce(
      (sum, m) => sum + (m.monthlyInstallment || 0),
      0
    );

    const memberData = await MemberData.create({
      mandal: mandal._id,
      subUser: subUser._id,
      monthId: currentMonth._id,

      installment: currentMonth.monthlyInstallment, 
      pendingInstallment,                            
      paidInstallment: 0,

      interest: 0,
      pendingInterest: 0,
      paidInterest: 0,

      withdrawal: 0,
      newWithdrawal: 0,
      paidWithdrawal: 0,

      fine: 0,
      total: 0,
    });

    return NextResponse.json(
      {
        message: "Sub-user created successfully",
        data: memberData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating sub-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    if (decoded?.role === "mandal") {
      // Mandal user → only their sub-users
      subUsers = await MandalSubUser.find({ mandal: decoded.id });
    } else if (decoded?.role === "admin") {
      // Admin → get ALL sub-users across all mandals
      subUsers = await MandalSubUser.find().populate("mandal");
      // (populate ensures mandal info is there for frontend matching)
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(subUsers, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching sub-users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
