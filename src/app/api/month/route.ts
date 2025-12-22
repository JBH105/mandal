import { addNewMonth, getMonth } from "@/controllers/mandal_month.controller";

// Handle GET requests (get mandals)
export async function GET(request: Request) {
  return await getMonth(request);
}

export async function POST(request: Request) {
  return await addNewMonth(request);
}