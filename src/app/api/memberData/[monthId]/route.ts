import { getMemberData } from "@/controllers/memberData.controller";

export async function GET(
  request: Request,
  context: { params: Promise<{ monthId: string }> }
) {
  const { monthId } = await context.params;
  return getMemberData(request as any, monthId);
}
