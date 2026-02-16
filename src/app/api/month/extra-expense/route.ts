import { addExtraExpenseByMonth } from "@/controllers/mandal_month.controller";

export async function POST(request: Request) {
  return await addExtraExpenseByMonth(request as any);
}
