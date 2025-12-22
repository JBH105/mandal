import { setNewInstallment } from "@/controllers/memberData.controller";

export async function POST(request: Request) {
  return await setNewInstallment(request);
}
