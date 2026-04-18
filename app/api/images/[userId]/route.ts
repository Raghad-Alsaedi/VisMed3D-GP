import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { db } from "@/database/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = await params;
    const defaultPath = join(
      process.cwd(),
      "picture",
      "profiles",
      "default-avatar.png",
    );

    if (userId === "default") {
      const imageBuffer = await readFile(defaultPath);
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
    }

    let prefix = "";
    let actualId = "";

    if (userId.startsWith("doctor_")) {
      prefix = "doctor";
      actualId = userId.replace("doctor_", "");
    } else if (userId.startsWith("patient_")) {
      prefix = "patient";
      actualId = userId.replace("patient_", "");
    } else if (userId.startsWith("tech_")) {
      prefix = "tech";
      actualId = userId.replace("tech_", "");
    } else {
      console.log("Invalid userId format:", userId);
      const imageBuffer = await readFile(defaultPath);
      return new NextResponse(imageBuffer, {
        headers: { "Content-Type": "image/png" },
      });
    }

    let isAuthorized = false;

    if (session.user.role === "admin") {
      isAuthorized = true;
    } else if (session.user.role === "patient") {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT patient_id FROM users WHERE id = ?",
        [session.user.id],
      );
      isAuthorized =
        prefix === "patient" &&
        rows.length > 0 &&
        rows[0].patient_id === Number(actualId);
    } else if (session.user.role === "doctor") {
      const [doctorRows] = await db.query<RowDataPacket[]>(
        "SELECT doctor_id FROM users WHERE id = ?",
        [session.user.id],
      );

      if (doctorRows.length === 0) {
        console.log("Doctor not found");
        isAuthorized = false;
      } else {
        const doctorId = doctorRows[0].doctor_id;

        if (prefix === "doctor") {
          isAuthorized = true;
        } else if (prefix === "patient") {
          const [assignmentRows] = await db.query<RowDataPacket[]>(
            "SELECT 1 FROM doctor_patient_assignments WHERE doctor_id = ? AND patient_id = ?",
            [doctorId, Number(actualId)],
          );
          isAuthorized = assignmentRows.length > 0;
          if (!isAuthorized) {
            console.log(
              `Unauthorized Access: Doctor ${doctorId} is attempting to access Patient ${actualId} - Not assigned.`,
            );
          }
        } else if (prefix === "tech") {
          isAuthorized = true;
        }
      }
    } else if (session.user.role === "technician") {
      const [techRows] = await db.query<RowDataPacket[]>(
        "SELECT technician_id FROM users WHERE id = ?",
        [session.user.id],
      );

      if (techRows.length === 0) {
        isAuthorized = false;
      } else {
        const techId = techRows[0].technician_id;

        if (prefix === "tech" && techId === Number(actualId)) {
          isAuthorized = true;
        } else if (prefix === "patient") {
          const [assignmentRows] = await db.query<RowDataPacket[]>(
            "SELECT 1 FROM technician_patient_assignments WHERE technician_id = ? AND patient_id = ?",
            [techId, Number(actualId)],
          );
          isAuthorized = assignmentRows.length > 0;
        } else if (prefix === "doctor") {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      console.log(
        "Unauthorized - Role:",
        session.user.role,
        "attempting to access:",
        userId,
      );
      return new NextResponse("Forbidden", { status: 403 });
    }

    console.log("Authorized - Fetching image:", userId);

    const possiblePaths = [
      join(process.cwd(), "picture", "profiles", `${userId}.png`),
      join(process.cwd(), "picture", "profiles", `${userId}.jpg`),
      join(process.cwd(), "picture", "profiles", `${userId}.jpeg`),
    ];

    for (const imagePath of possiblePaths) {
      if (existsSync(imagePath)) {
        console.log("Image found:", imagePath);
        const imageBuffer = await readFile(imagePath);
        const extension = imagePath.split(".").pop()?.toLowerCase();
        const contentType =
          extension === "png"
            ? "image/png"
            : extension === "jpg" || extension === "jpeg"
              ? "image/jpeg"
              : "image/png";

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    console.log("Image not found, falling back to default.");
    const imageBuffer = await readFile(defaultPath);
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
