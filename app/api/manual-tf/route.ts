import { NextRequest, NextResponse } from "next/server";
import { db } from '@/database/db';
import mysql from "mysql2/promise";



interface StepRow {
  stepOrder:  number;
  rangeStart: number;
  rangeEnd:   number;
  rangeValue: number;
  color:       string;
  opacity:     number;
}

export async function GET(req: NextRequest) {
  const accessionId = req.nextUrl.searchParams.get("accession_id");

  if (!accessionId) {
    return NextResponse.json(
      { error: "accession_id is required" },
      { status: 400 }
    );
  }

  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT step_order, range_start, range_end, range_value, color, opacity
     FROM   manual_tf_steps
     WHERE  accession_id = ?
     ORDER  BY step_order ASC`,
    [accessionId]
  );

  // Map snake_case DB column names to the camelCase keys ManualTFDisplay expects
  const steps: StepRow[] = (rows as any[]).map((row) => ({
    stepOrder:  row.step_order,
    rangeStart: row.range_start,
    rangeEnd:   row.range_end,
    rangeValue: row.range_value,
    color:      row.color,
    opacity:    Number(row.opacity),
  }));

  return NextResponse.json({ steps });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accessionId, steps } = body as {
    accessionId: number;
    steps: StepRow[];
  };

  if (!accessionId || !Array.isArray(steps) || steps.length === 0) {
    return NextResponse.json(
      { error: "accessionId and steps are required" },
      { status: 400 }
    );
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      "DELETE FROM manual_tf_steps WHERE accession_id = ?",
      [accessionId]
    );

    const values = steps.map((step, index) => [
      accessionId,
      index + 1,
      step.rangeStart,
      step.rangeEnd,
      step.rangeValue,
      step.color,
      step.opacity,
    ]);

    await conn.query(
      `INSERT INTO manual_tf_steps
         (accession_id, step_order, range_start, range_end, range_value, color, opacity)
       VALUES ?`,
      [values]
    );

    await conn.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error("Failed to save manual TF steps:", err);
    return NextResponse.json(
      { error: "Failed to save steps" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}