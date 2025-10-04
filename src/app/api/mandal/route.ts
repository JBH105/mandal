import { createMandal, deleteMandal, getMandals, updateMandal } from "@/controllers/mandal.controller";

// Handle POST requests (create mandal)
export async function POST(request: Request) {
  return await createMandal(request);
}

// Handle GET requests (get mandals)
export async function GET(request: Request) {
  return await getMandals(request);
}

// Handle DELETE requests (delete mandal)
export async function DELETE(request: Request) {
  return await deleteMandal(request);
}

export async function PUT(request: Request) {
  return await updateMandal(request);
}
