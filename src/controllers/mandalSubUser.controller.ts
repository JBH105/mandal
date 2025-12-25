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


export async function getMandalSubUsers(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;

    let subUsers;

    if (decoded?.role === "mandal") {
      subUsers = await MandalSubUser.find({ mandal: decoded.id });
    } else if (decoded?.role === "admin") {
      subUsers = await MandalSubUser.find().populate("mandal");
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
