import { type NextRequest, NextResponse } from "next/server"

// Function to sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_") // Replace any non-alphanumeric chars with underscore
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    console.log("=== UPLOAD API DEBUG ===")
    console.log("Original filename:", filename)

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Check if blob token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("=== BLOB TOKEN MISSING ===")
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter((key) => key.includes("BLOB")),
      )
      return NextResponse.json(
        {
          error: "BLOB_READ_WRITE_TOKEN not configured",
          suggestion: "Please add BLOB_READ_WRITE_TOKEN to your environment variables",
        },
        { status: 500 },
      )
    }

    console.log("Token exists, length:", process.env.BLOB_READ_WRITE_TOKEN.length)

    // Get file data
    const arrayBuffer = await request.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    console.log("File buffer size:", fileBuffer.length)

    if (fileBuffer.length === 0) {
      return NextResponse.json({ error: "No file data received" }, { status: 400 })
    }

    // Check file size (5MB limit for standard uploads to avoid Vercel Blob limits)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File too large",
          details: `File size: ${Math.round(fileBuffer.length / 1024 / 1024)}MB, limit: 5MB`,
          suggestion: "For files larger than 5MB, please use URL upload method or compress the image first",
        },
        { status: 413 },
      )
    }

    // Sanitize filename and create unique name
    const sanitizedFilename = sanitizeFilename(filename)
    const timestamp = Date.now()
    const uniqueFilename = `excursions/${timestamp}_${sanitizedFilename}`

    console.log("Sanitized filename:", uniqueFilename)

    // Try to import and use Vercel Blob
    try {
      const { put } = await import("@vercel/blob")
      console.log("Vercel Blob imported successfully")

      console.log("Attempting upload...")

      // Upload with explicit options and size limit
      const blob = await put(uniqueFilename, fileBuffer, {
        access: "public",
        addRandomSuffix: false,
        // Explicitly set maximum size
        maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
      })

      console.log("Upload successful:", blob.url)
      return NextResponse.json({ url: blob.url })
    } catch (blobError: any) {
      console.error("=== BLOB ERROR DETAILS ===")
      console.error("Error name:", blobError?.name)
      console.error("Error message:", blobError?.message)
      console.error("Error stack:", blobError?.stack)
      console.error("Error cause:", blobError?.cause)

      // Try to get more details from the error
      if (blobError?.response) {
        console.error("Error response status:", blobError.response.status)
        console.error("Error response statusText:", blobError.response.statusText)

        try {
          const errorText = await blobError.response.text()
          console.error("Error response body:", errorText)
        } catch (e) {
          console.error("Could not read error response body")
        }
      }

      // Handle specific error cases
      if (blobError?.message?.includes("401") || blobError?.message?.includes("Unauthorized")) {
        return NextResponse.json(
          {
            error: "Authentication failed",
            details: "Invalid or expired BLOB_READ_WRITE_TOKEN",
            suggestion: "Please regenerate your blob token in Vercel dashboard",
          },
          { status: 401 },
        )
      }

      if (blobError?.message?.includes("403") || blobError?.message?.includes("Forbidden")) {
        return NextResponse.json(
          {
            error: "Permission denied",
            details: "Blob storage access forbidden",
            suggestion: "Check your blob storage permissions",
          },
          { status: 403 },
        )
      }

      if (
        blobError?.message?.includes("413") ||
        blobError?.message?.includes("too large") ||
        blobError?.message?.includes("Request En")
      ) {
        return NextResponse.json(
          {
            error: "File too large for Vercel Blob",
            details: "File exceeds Vercel Blob storage size limit",
            suggestion: "Please use a file smaller than 5MB or use the URL upload method",
          },
          { status: 413 },
        )
      }

      if (blobError?.name === "SyntaxError" && blobError?.message?.includes("Request En")) {
        return NextResponse.json(
          {
            error: "Vercel Blob size limit exceeded",
            details: "The file is too large for your current Vercel plan",
            suggestion: "Please use a file smaller than 5MB or upgrade your Vercel plan",
          },
          { status: 413 },
        )
      }

      if (blobError?.name === "SyntaxError") {
        return NextResponse.json(
          {
            error: "Blob service error",
            details: "Invalid response from blob storage service",
            suggestion: "The blob token might be invalid or the service is unavailable",
          },
          { status: 502 },
        )
      }

      return NextResponse.json(
        {
          error: "Blob upload failed",
          details: blobError?.message || String(blobError),
          errorType: blobError?.name || "Unknown",
          suggestion: "Try with a smaller file or use the URL upload method",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR ===")
    console.error("Error:", error)
    console.error("Error stack:", error?.stack)

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error?.message || String(error),
        errorType: error?.name || "Unknown",
      },
      { status: 500 },
    )
  }
}
