import { connectToDB } from "@/config/db";
import Mandal from "@/model/Mandal";
import MandalSubUser from "@/model/MandalSubUser";
import MandalMonth from "@/model/MandalMonth";
import MemberData from "@/model/MemberData";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface DecodedToken {
  id: string;
  phoneNumber: string;
  role?: string;
}

export async function getSession(): Promise<DecodedToken | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export async function getMandalsService() {
  await connectToDB();
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (session.role === "mandal") {
    const mandal = await Mandal.findById(session.id, "-password").lean();
    return mandal ? [JSON.parse(JSON.stringify(mandal))] : [];
  }
  
  const mandals = await Mandal.find({}, "-password").lean();
  return JSON.parse(JSON.stringify(mandals));
}

export async function getMandalSubUsersService() {
  await connectToDB();
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  let subUsers;
  if (session.role === "mandal") {
    subUsers = await MandalSubUser.find({ mandal: session.id }).lean();
  } else if (session.role === "admin") {
    subUsers = await MandalSubUser.find().populate("mandal").lean();
  } else {
    throw new Error("Unauthorized");
  }

  return JSON.parse(JSON.stringify(subUsers));
}

export async function getMonthService() {
  await connectToDB();
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  let months;
  if (session.role === "mandal") {
    months = await MandalMonth.find({ mandal: session.id }).sort({ month: -1 }).lean();
  } else {
    months = await MandalMonth.find().sort({ month: -1 }).lean();
  }

  return JSON.parse(JSON.stringify(months));
}

export async function getMemberDataService(monthId: string) {
  await connectToDB();
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const query: any = { monthId };
  if (session.role === "mandal") {
    query.mandal = session.id;
  }

  const memberData = await MemberData.find(query).populate("subUser").lean();
  return JSON.parse(JSON.stringify(memberData));
}
