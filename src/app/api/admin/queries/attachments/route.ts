import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/admin/queries/attachments - Upload an attachment and link it to a query or response
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File;
    const queryId = form.get("queryId") as string | null;
    const responseId = form.get("responseId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Reuse the admin upload endpoint logic by saving under public/uploads directly here
    // simple save: write to public/uploads/images or videos depending on mime
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm"];
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);
    if (!isImage && !isVideo) {
      return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
    }

    // Limit size
    const maxSize = 25 * 1024 * 1024; // 25MB for attachments
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large" }, { status: 400 });
    }

    // Save to disk (mirror of admin upload)
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

    // persist attachment record
    const attachment = await db.createQueryAttachment({
      queryId: queryId || undefined,
      responseId: responseId || undefined,
      filename: fileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: publicUrl,
      uploadedBy: "admin",
      isPublic: true,
    });

    return NextResponse.json({ success: true, data: attachment, message: "Attachment uploaded" }, { status: 201 });
  } catch (error) {
    console.error("Error uploading query attachment:", error);
    return NextResponse.json({ success: false, error: "Failed to upload attachment" }, { status: 500 });
  }
}
