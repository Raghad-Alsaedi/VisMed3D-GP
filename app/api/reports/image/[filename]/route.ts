import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/database/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const filename = params.filename;

    if (!filename || !filename.endsWith('.png')) {
      return NextResponse.json(
        { status: "error", message: "Invalid filename" },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), "picture", "reports-img", filename);

    if (!existsSync(filepath)) {
      console.error(' File not found:', filepath);
      return NextResponse.json(
        { status: "error", message: "Image not found" },
        { status: 404 }
      );
    }

    const [userRows] = await db.query(
      `
      SELECT role, doctor_id, patient_id 
      FROM users 
      WHERE id = ? 
      LIMIT 1
      `,
      [userId]
    ) as any;

    if (!userRows || userRows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const user = userRows[0];

    const accessionIdMatch = filename.match(/screenshot_(\d+)_\d+\.png/);
    if (!accessionIdMatch) {
      console.error('Invalid filename format:', filename);
      return NextResponse.json(
        { status: "error", message: "Invalid filename format" },
        { status: 400 }
      );
    }

    const accessionId = accessionIdMatch[1];

    if (user.role === 'doctor') {
      const [access] = await db.query(
        `
        SELECT r.report_id 
        FROM reports r
        WHERE r.accession_id = ? AND r.doctor_id = ?
        LIMIT 1
        `,
        [accessionId, user.doctor_id]
      ) as any;

      if (!access || access.length === 0) {
        console.error(' Doctor access denied for accession:', accessionId);
        return NextResponse.json(
          { status: "error", message: "Access denied" },
          { status: 403 }
        );
      }
    } else if (user.role === 'patient') {
      const [access] = await db.query(
        `
        SELECT a.accession_id 
        FROM accession a
        WHERE a.accession_id = ? AND a.patient_id = ?
        LIMIT 1
        `,
        [accessionId, user.patient_id]
      ) as any;

      if (!access || access.length === 0) {
        console.error(' Patient access denied for accession:', accessionId);
        return NextResponse.json(
          { status: "error", message: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      console.error('Invalid role:', user.role);
      return NextResponse.json(
        { status: "error", message: "Access denied" },
        { status: 403 }
      );
    }

    const imageBuffer = await readFile(filepath);

    console.log(' Image served successfully:', filename);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, max-age=31536000',
      },
    });

  } catch (err) {
    console.error(" GET IMAGE ERROR:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { status: "error", message: "Server error: " + errorMessage },
      { status: 500 }
    );
  }
}