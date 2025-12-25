import { updateMandal, deleteMandal } from "@/controllers/mandal.controller";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 
  console.log("ROUTE ID:", id);
  return updateMandal(request , id);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 
  console.log("ROUTE ID:", id);
  return deleteMandal(request , id);
}
