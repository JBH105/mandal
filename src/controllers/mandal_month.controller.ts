// src/controllers/mandal_month.controller.ts

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
    // Apply auth middleware (admin role required)
    const authResult = await authMiddleware(request, "admin");
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

export async function getMonth(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;

    const monthData = await MandalMonth.find({ mandal: decoded!.id });

    return NextResponse.json(monthData, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function addNewMonth(request: AuthenticatedRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    await connectToDB();

    const { decoded } = request;

    const mandalUserData = await MandalSubUser.findOne({
      mandal: decoded!.id,
    });

    if (!mandalUserData) {
      return NextResponse.json({ error: "First add user" }, { status: 401 });
    }

    const lastMonthData = await MandalMonth.findOne({
      mandal: decoded!.id,
    }).sort({ month: -1 });

    let nextMonth: string;

    if (!lastMonthData) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      nextMonth = `${year}-${month}`;
    } else {
      const [yearStr, monthStr] = lastMonthData.month.split("-");
      let year = Number(yearStr);
      let month = Number(monthStr);

      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }

      nextMonth = `${year}-${String(month).padStart(2, "0")}`;
    }

    const exists = await MandalMonth.findOne({
      mandal: decoded!.id,
      month: nextMonth,
    });

    if (exists) {
      return NextResponse.json(
        { error: `Month ${nextMonth} already exists` },
        { status: 400 }
      );
    }

    const newMonth = await MandalMonth.create({
      mandal: decoded!.id,
      month: nextMonth,
    });

    const lastMonthId = lastMonthData._id;

    const lastMonthMandalData = await MemberData.find({
      mandal: decoded!.id,
      monthId: lastMonthId,
    });

    const newData: unknown[] = [];

    for (const item of lastMonthMandalData) {
      const { _id, createdAt, updatedAt, ...rest } = item.toObject();

      
      const withdrawal =
        (rest.withdrawal || 0) -
        (rest.paidWithdrawal || 0) +
        (rest.newWithdrawal || 0);

      
      const interest = withdrawal > 0 ? (withdrawal * 1) / 100 : 0;

      
      const prevInstallment = rest.installment || 0;
      const prevPaidInstallment = rest.paidInstallment || 0;

      const unpaidInstallment =
        prevPaidInstallment < prevInstallment
          ? prevInstallment - prevPaidInstallment
          : 0;

      const pendingInstallment =
        (rest.pendingInstallment || 0) +
        unpaidInstallment +
        interest;

      newData.push({
        ...rest,
        monthId: newMonth._id,
        withdrawal,
        interest,
        pendingInstallment,
        paidWithdrawal: 0,
        newWithdrawal: 0,
        paidInterest: 0,
        paidInstallment: 0,
      });
    }

    await MemberData.insertMany(newData);

    return NextResponse.json(
      {
        message: "New month created successfully",
        month: newMonth.month,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
