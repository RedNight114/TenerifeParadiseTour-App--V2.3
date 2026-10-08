import { redirect } from "next/navigation"

// Keep old bookmarks working while categories now live inside the catalog.
export default function LegacyCategoriesRoute() {
  redirect("/admin/manage-excursions?view=categories")
}
