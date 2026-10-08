import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase-server"

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
    const supabase = await createServerSupabaseClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    // Admin workspaces can run on a Vercel preview hostname that is not mapped
    // to a public organization domain. Use the selected workspace when present;
    // the membership check below remains the authorization boundary.
    const cookieStore = await cookies()
    const selectedOrganizationId = cookieStore.get("qa_active_organization")?.value
    const { data: publicOrganizationId } = await supabase.rpc("current_public_organization_id")
    const organizationId = selectedOrganizationId || publicOrganizationId
    if (!organizationId) return NextResponse.json({ error: "Organization is not configured for this domain" }, { status: 403 })

    const { data: membership } = await supabase
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", authData.user.id)
      .eq("status", "active")
      .maybeSingle()
    if (!membership || !["owner", "admin", "catalog_manager"].includes(membership.role)) {
      return NextResponse.json({ error: "Catalog administrator access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    const extension = filename.split(".").pop()?.toLowerCase()
    const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif"])
    if (!extension || !allowedExtensions.has(extension)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, and AVIF images are allowed" }, { status: 415 })
    }

    // Check if blob token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: "BLOB_READ_WRITE_TOKEN not configured",
          suggestion: "Please add BLOB_READ_WRITE_TOKEN to your environment variables",
        },
        { status: 500 },
      )
    }

    // Get file data
    const arrayBuffer = await request.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

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
    const uniqueFilename = `organizations/${organizationId}/excursions/${timestamp}_${sanitizedFilename}`

    // Try to import and use Vercel Blob
    try {
      const { put } = await import("@vercel/blob")
      // Upload with explicit options and size limit
      const blob = await put(uniqueFilename, fileBuffer, {
        access: "public",
        addRandomSuffix: false,
        contentType: request.headers.get("content-type")?.split(";")[0] || "application/octet-stream",
      })

      return NextResponse.json({ url: blob.url })
    } catch (blobError: unknown) {
      const blobMessage = blobError instanceof Error ? blobError.message : String(blobError)
      const blobName = blobError instanceof Error ? blobError.name : "Unknown"
      console.error("Blob upload failed:", blobMessage)

      // Handle specific error cases
      if (blobMessage.includes("401") || blobMessage.includes("Unauthorized")) {
        return NextResponse.json(
          {
            error: "Authentication failed",
            details: "Invalid or expired BLOB_READ_WRITE_TOKEN",
            suggestion: "Please regenerate your blob token in Vercel dashboard",
          },
          { status: 401 },
        )
      }

      if (blobMessage.includes("403") || blobMessage.includes("Forbidden")) {
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
        blobMessage.includes("413") ||
        blobMessage.includes("too large") ||
        blobMessage.includes("Request En")
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

      if (blobError instanceof SyntaxError && blobMessage.includes("Request En")) {
        return NextResponse.json(
          {
            error: "Vercel Blob size limit exceeded",
            details: "The file is too large for your current Vercel plan",
            suggestion: "Please use a file smaller than 5MB or upgrade your Vercel plan",
          },
          { status: 413 },
        )
      }

      if (blobError instanceof SyntaxError) {
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
          errorType: blobName,
          suggestion: "Try with a smaller file or use the URL upload method",
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    const errorName = error instanceof Error ? error.name : "Unknown"
    console.error("Upload failed:", error)

    return NextResponse.json(
      {
        error: "Upload failed",
        errorType: errorName,
      },
      { status: 500 },
    )
  }
}
