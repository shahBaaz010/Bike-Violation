import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { UpdateCaseRequest } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/admin/cases/attach - Upload a file and attach it to a case
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File;
    const caseId = form.get("caseId") as string | null;

    if (!file || !caseId) {
      return NextResponse.json({ success: false, error: "File and caseId are required" }, { status: 400 });
    }

    // Reuse logic similar to queries attachments
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm"];
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);
    if (!isImage && !isVideo) return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ success: false, error: "File too large" }, { status: 400 });

    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const { existsSync } = await import("fs");
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });
    const sub = isImage ? "images" : "videos";
    const typeDir = join(uploadsDir, sub);
    if (!existsSync(typeDir)) await mkdir(typeDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = (file.name || "").split('.').pop() || (isImage ? 'jpg' : 'mp4');
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = join(typeDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const publicUrl = `/uploads/${sub}/${fileName}`;

    // Update case: add to evidenceUrls; optionally set proofUrl if not set
    const existing = await db.getCaseById(caseId);
    if (!existing) return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });

    const evidence = existing.evidenceUrls || [];
    evidence.push(publicUrl);
  const updates: Partial<UpdateCaseRequest> & { proofUrl?: string } = { evidenceUrls: evidence };
  if (!existing.proofUrl) updates.proofUrl = publicUrl;

    const updated = await db.updateCase(caseId, updates);

    return NextResponse.json({ success: true, data: { url: publicUrl, case: updated }, message: "File attached to case" }, { status: 200 });
  } catch (error) {
    console.error("Error attaching file to case:", error);
    return NextResponse.json({ success: false, error: "Failed to attach file" }, { status: 500 });
  }
}
