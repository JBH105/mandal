import { updateMandalInstallment } from "@/controllers/mandal.controller";

export async function PUT(request: Request) {
  return await updateMandalInstallment(request);
}
