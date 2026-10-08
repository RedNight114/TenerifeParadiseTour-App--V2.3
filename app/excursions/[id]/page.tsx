"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ExcursionDetailExperience } from "@/components/excursion-detail-experience"
import { getCategories, getExcursionById, type Category, type Excursion } from "@/lib/supabase"

export default function ExcursionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [excursion, setExcursion] = useState<Excursion | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    const parsedId = Number.parseInt(id, 10)
    if (!Number.isFinite(parsedId)) {
      setFailed(true)
      return
    }
    Promise.all([getExcursionById(parsedId), getCategories()]).then(([result, categoryList]) => {
      if (!active) return
      if (result) {
        setExcursion(result)
        setCategories(categoryList)
      } else setFailed(true)
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    if (failed) router.replace("/excursions")
  }, [failed, router])

  if (!excursion) return <main className="grid min-h-[65vh] place-items-center bg-[#f7f8f6] px-4" aria-live="polite"><div className="text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-teal-700 border-t-transparent motion-reduce:animate-none" /><p className="mt-4 text-sm text-slate-600">Cargando excursión…</p></div></main>
  const category = categories.find((item) => excursion.category === String(item.id) || excursion.category === item.name_es)
  return <ExcursionDetailExperience excursion={excursion} categoryNames={category ? { es: category.name_es, en: category.name_en || category.name_es } : undefined} />
}
