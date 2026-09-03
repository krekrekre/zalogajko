import { getIsAdmin } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: await getIsAdmin() });
}
