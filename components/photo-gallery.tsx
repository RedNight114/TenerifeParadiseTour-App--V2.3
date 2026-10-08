"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface PhotoGalleryProps {
  images: string[]
  title?: string
  subtitle?: string
  badge?: string
}

export function PhotoGallery({ images, title, subtitle, badge }: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { t, language } = useLanguage()

  const nextImage = useCallback(() => {
    setSelectedImage((current) => current === null || images.length === 0 ? current : (current + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setSelectedImage((current) => current === null || images.length === 0 ? current : current === 0 ? images.length - 1 : current - 1)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImage === null) return
      if (event.key === "ArrowRight") {
        event.preventDefault()
        nextImage()
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        prevImage()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, nextImage, prevImage])

  const displayImages = showAllPhotos ? images : images.slice(0, 6)
  const remainingCount = Math.max(0, images.length - 6)
  const imageAlt = (index: number) => language === "en" ? `Experience photo ${index + 1}` : `Foto de experiencia ${index + 1}`

  return (
    <Dialog.Root open={selectedImage !== null} onOpenChange={(open) => { if (!open) setSelectedImage(null) }}>
      <section className="bg-[#f4f8f7] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-800/10 bg-white px-4 py-2 text-sm font-medium text-teal-800 shadow-sm">
              <Camera aria-hidden="true" className="h-4 w-4" />
              {badge || "Galería"}
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title || t("gallery.title")}</h2>
            <p className="mx-auto max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{subtitle || t("gallery.subtitle")}</p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {displayImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className="photo-gallery__tile group relative overflow-hidden rounded-2xl bg-white text-left shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                aria-label={`${language === "en" ? "Open photo" : "Abrir foto"}: ${imageAlt(index)}`}
                onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedImage(index) }}
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={imageAlt(index)}
                    fill
                    className="photo-gallery__image object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors duration-200 group-hover:bg-slate-950/25 group-focus-visible:bg-slate-950/25">
                    <span className="scale-95 rounded-full bg-white p-3 text-teal-800 opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                      <Camera aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          {!showAllPhotos && remainingCount > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAllPhotos(true)}
                className="inline-flex min-h-11 items-center rounded-lg bg-teal-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                <Camera aria-hidden="true" className="mr-2 h-5 w-5" />
                {t("gallery.view_all_photos")}
              </button>
              <p className="mt-2 text-sm text-slate-500">{t("gallery.explore_complete")} {images.length} {t("gallery.more_images")}</p>
            </div>
          )}
        </div>
      </section>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus() }}
        >
          <Dialog.Title className="sr-only">{t("gallery.title")}</Dialog.Title>
          <Dialog.Description className="sr-only">{t("gallery.instructions")}</Dialog.Description>

          <Dialog.Close
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:top-6"
            aria-label={t("gallery.close")}
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </Dialog.Close>

          {images.length > 1 && <>
            <button type="button" onClick={prevImage} className="absolute left-2 z-10 rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6" aria-label={t("gallery.previous")}>
              <ChevronLeft aria-hidden="true" className="h-7 w-7" />
            </button>
            <button type="button" onClick={nextImage} className="absolute right-2 z-10 rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6" aria-label={t("gallery.next")}>
              <ChevronRight aria-hidden="true" className="h-7 w-7" />
            </button>
          </>}

          {selectedImage !== null && images[selectedImage] && (
            <div className="relative h-[min(78vh,800px)] w-full max-w-6xl">
              <Image src={images[selectedImage]} alt={imageAlt(selectedImage)} fill sizes="100vw" className="object-contain" priority />
            </div>
          )}

          <p aria-live="polite" className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-sm text-white/80">
            {selectedImage !== null ? `${selectedImage + 1} / ${images.length}` : ""}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
