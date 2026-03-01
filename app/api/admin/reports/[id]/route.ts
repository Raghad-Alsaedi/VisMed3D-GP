import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.query(`DELETE FROM reports WHERE report_id = ?`, [id]);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Report DELETE error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to delete report" },
      { status: 500 }
    );
  }
}