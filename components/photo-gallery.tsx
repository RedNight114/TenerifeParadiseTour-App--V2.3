"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

interface PhotoGalleryProps {
  images?: string[]
  title?: string
  subtitle?: string
}

export function PhotoGallery({ images: propImages, title, subtitle }: PhotoGalleryProps) {
  const [images, setImages] = useState<string[]>(propImages || [])
  const [loading, setLoading] = useState(!propImages)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    if (!propImages) {
      fetchImages()
    }
  }, [propImages])

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("excursions")
        .select("gallery_images")
        .not("gallery_images", "is", null)
        .limit(20)

      if (error) throw error

      const allImages = data?.flatMap((excursion) => excursion.gallery_images || []).filter(Boolean) || []

      // Si no hay imágenes de la base de datos, usar imágenes de placeholder
      if (allImages.length === 0) {
        const placeholderImages = [
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
        ]
        setImages(placeholderImages)
      } else {
        setImages(allImages)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      // En caso de error, usar imágenes de placeholder
      const placeholderImages = [
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
      ]
      setImages(placeholderImages)
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = "unset"
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === "Escape") closeLightbox()
        if (e.key === "ArrowRight") nextImage()
        if (e.key === "ArrowLeft") prevImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("gallery.loading")}</p>
          </div>
        </div>
      </section>
    )
  }

  const displayImages = showAllPhotos ? images : images.slice(0, 6)
  const remainingCount = Math.max(0, images.length - 6)

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Camera className="w-4 h-4 mr-2" />
              {t("gallery.badge")}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{title || t("gallery.title")}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle || t("gallery.subtitle")}</p>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Aventura en Tenerife ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para ver todas las fotos */}
          {!showAllPhotos && remainingCount > 0 && (
            <div className="text-center">
              <button
                onClick={() => setShowAllPhotos(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Camera className="w-5 h-5 mr-2" />
                {t("gallery.view_all_photos")}
              </button>
              <p className="mt-2 text-sm text-gray-500">
                {t("gallery.explore_complete")} {images.length} {t("gallery.more_images")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label={t("gallery.close")}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              aria-label={t("gallery.previous")}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              aria-label={t("gallery.next")}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="relative max-w-4xl max-h-full">
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={`Aventura en Tenerife ${selectedImage + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="text-sm opacity-75">{t("gallery.instructions")}</p>
              <p className="text-lg font-medium">
                {selectedImage + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
