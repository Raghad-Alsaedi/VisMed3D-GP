import { db } from "@/database/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    return Response.json({ status: "ok", rows });
  } catch (err) {
    return Response.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}