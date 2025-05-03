import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
// postgresql://neondb_owner:npg_Fh1G3QWslopj@ep-red-union-a4tiqc57-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get file extension
    const originalName = file.name
    const extension = originalName.split(".").pop().toLowerCase()

    // Validate file type
    const allowedTypes = ["jpg", "jpeg", "png", "gif", "webp"]
    if (!allowedTypes.includes(extension)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Generate unique filename
    const filename = `${uuidv4()}.${extension}`
    const path = join(process.cwd(), "public", "uploads", filename)

    // Save file
    await writeFile(path, buffer)

    // Return the URL to the uploaded file
    return NextResponse.json({
      url: `/uploads/${filename}`,
      success: true,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
