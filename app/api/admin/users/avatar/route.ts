import { NextResponse } from "next/server";
import { db } from "@/database/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const id   = formData.get("id")   as string;
    const role = formData.get("role") as string;
    const file = formData.get("profile_picture") as File | null;

    if (!id || !role || !file || file.size === 0) {
      return NextResponse.json(
        { status: "error", message: "id, role, and profile_picture are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { status: "error", message: "Only JPG, PNG, or WEBP images are allowed" },
        { status: 400 }
      );
    }

    // Enforce 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { status: "error", message: "Max file size is 5MB" },
        { status: 400 }
      );
    }

    // Fetch the role-specific ID for building a unique file name
    const [[userRow]]: any = await db.query(
      `SELECT doctor_id, patient_id, technician_id FROM users WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!userRow) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const prefix =
      role === "doctor"     ? "doctor"  :
      role === "technician" ? "tech"    : "patient";

    const roleId =
      role === "doctor"     ? userRow.doctor_id     :
      role === "technician" ? userRow.technician_id : userRow.patient_id;

    const fileId   = `${prefix}_${roleId}`;
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${fileId}.${ext}`;
    const dir      = path.join(process.cwd(), "picture", "profiles");

    await mkdir(dir, { recursive: true });

    // Delete any existing avatar for this user before saving the new one
    for (const e of ["png", "jpg", "jpeg", "webp"]) {
      const oldPath = path.join(dir, `${fileId}.${e}`);
      if (existsSync(oldPath)) {
        await unlink(oldPath).catch(() => {});
        break;
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, fileName), buffer);

    // Store only the API path (not the full filesystem path) in the database
    const profilePicture = `api/images/${fileId}`;
    await db.query(
      `UPDATE users SET profile_picture = ? WHERE id = ?`,
      [profilePicture, id]
    );

    return NextResponse.json({ status: "ok", profilePicture });

  } catch (err: any) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}