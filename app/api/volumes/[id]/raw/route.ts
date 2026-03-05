import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const volumeId = Number(context.params.id);

  if (!Number.isFinite(volumeId) || volumeId <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid volume id" },
      { status: 400 }
    );
  }

  let conn: any;

  try {
    conn = await (db as any).getConnection();

 
    const [vRows]: any = await conn.query(
     `SELECT byte_size FROM volumes WHERE id = ? LIMIT 1`,
      [volumeId]
    );

    if (!vRows?.length) {
      return NextResponse.json(
        { success: false, error: "Volume not found" },
        { status: 404 }
      );
    }

    const expectedSize = Number(vRows[0].byte_size);

    // جلب الشنكات مرتبة
    const [rows]: any = await conn.query(
      `SELECT data
       FROM volume_chunks
       WHERE volume_id = ?
       ORDER BY chunk_index ASC`,
      [volumeId]
    );

    if (!rows?.length) {
      return NextResponse.json(
        { success: false, error: "No chunks found" },
        { status: 404 }
      );
    }

    // تجميع الشنكات
    const buffers = rows.map((r: any) => Buffer.from(r.data));
    const fullBuffer = Buffer.concat(buffers);

    //  تحقق أمني مهم جدًا
    if (fullBuffer.length !== expectedSize) {
      console.error("Size mismatch!", {
        expected: expectedSize,
        actual: fullBuffer.length,
      });

      return NextResponse.json(
        { success: false, error: "Corrupted volume data" },
        { status: 500 }
      );
    }

    return new NextResponse(fullBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(fullBuffer.length),
        "Content-Disposition":`attachment; filename="volume-${volumeId}.raw"`,
      },
    });
  } catch (err: any) {
    console.error("RAW fetch error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}