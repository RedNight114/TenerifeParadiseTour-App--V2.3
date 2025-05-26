import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    console.log("Upload request received for filename:", filename)

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN environment variable is not set")
      return NextResponse.json(
        {
          error: "Server configuration error: Missing blob token",
          solution: "Please add BLOB_READ_WRITE_TOKEN to your environment variables",
        },
        { status: 500 },
      )
    }

    // Get the request body as a stream/buffer
    let fileBuffer: Buffer
    try {
      const arrayBuffer = await request.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      console.log("File buffer size:", fileBuffer.length)
    } catch (error) {
      console.error("Error reading request body:", error)
      return NextResponse.json({ error: "Failed to read file data" }, { status: 400 })
    }

    if (fileBuffer.length === 0) {
      return NextResponse.json({ error: "No file data received" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const uniqueFilename = `excursions/${timestamp}-${filename}`

    console.log("Uploading to blob with filename:", uniqueFilename)
    console.log("Blob token exists:", !!process.env.BLOB_READ_WRITE_TOKEN)

    // Upload to Vercel Blob with proper error handling
    let blob
    try {
      blob = await put(uniqueFilename, fileBuffer, {
        access: "public",
      })
    } catch (blobError: any) {
      console.error("Vercel Blob upload error:", blobError)

      // Handle different types of blob errors
      let errorMessage = "Failed to upload to blob storage"

      if (blobError.message) {
        errorMessage = blobError.message
      } else if (typeof blobError === "string") {
        errorMessage = blobError
      }

      // Check if it's an authentication error
      if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
        errorMessage = "Invalid blob storage token. Please check your BLOB_READ_WRITE_TOKEN."
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: "Blob storage upload failed",
          blobError: String(blobError),
        },
        { status: 500 },
      )
    }

    console.log("Upload successful, blob URL:", blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error in upload API:", error)

    // Handle different types of errors
    let errorMessage = "Failed to upload file"

    if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error details:", error.stack)
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: "Please check server configuration and try again",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
