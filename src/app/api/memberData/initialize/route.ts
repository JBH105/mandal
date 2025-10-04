import { initializeMonthData } from "@/controllers/memberData.controller";

export async function POST(request: Request) {
  return await initializeMonthData(request);
}