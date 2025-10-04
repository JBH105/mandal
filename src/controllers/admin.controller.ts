import { connectToDB } from "@/config/db";
import Admin from "@/model/Admin";
import Mandal from "@/model/Mandal";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { validateAdminLogin } from "@/utils/validation";
import { ZodError } from "zod";

export async function login(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    // Validate input using zod schema
    const { phoneNumber, password } = validateAdminLogin(body);

    // First check if admin
    let user = await Admin.findOne({ phoneNumber });
    let role = "admin";

    if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } else {
      // Check if mandal user
      user = await Mandal.findOne({ phoneNumber });
      role = "mandal";

      if (user) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const token = jwt.sign(
      { id: user._id, phoneNumber: user.phoneNumber, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    return NextResponse.json({ message: "Login successful", token }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error logging in:", error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    
    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}