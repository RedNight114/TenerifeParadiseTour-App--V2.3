"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

interface GalleryImage {
  id: string
  url: string
  title: string
  excursionId: string
}

export function PhotoGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data: excursions, error } = await supabase
          .from("excursions")
          .select("id, name_es, name_en, name_de, image_url, gallery_images")
          .not("image_url", "is", null)

        if (error) throw error

        const allImages: GalleryImage[] = []

        excursions?.forEach((excursion) => {
          // Obtener el nombre según el idioma
          const getExcursionName = () => {
            switch (language) {
              case "en":
                return excursion.name_en || excursion.name_es || excursion.name_de || "Excursion"
              case "de":
                return excursion.name_de || excursion.name_es || excursion.name_en || "Ausflug"
              default:
                return excursion.name_es || excursion.name_en || excursion.name_de || "Excursión"
            }
          }

          // Añadir imagen principal
          if (excursion.image_url) {
            allImages.push({
              id: `${excursion.id}-main`,
              url: excursion.image_url,
              title: getExcursionName(),
              excursionId: excursion.id,
            })
          }

          // Añadir imágenes de galería
          if (excursion.gallery_images && Array.isArray(excursion.gallery_images)) {
            excursion.gallery_images.forEach((imageUrl: string, index: number) => {
              allImages.push({
                id: `${excursion.id}-gallery-${index}`,
                url: imageUrl,
                title: getExcursionName(),
                excursionId: excursion.id,
              })
            })
          }
        })

        setImages(allImages)
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [language])

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setImageLoading(true)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    setImageLoading(false)
    document.body.style.overflow = "unset"
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setImageLoading(true)
      setSelectedImage((selectedImage + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setImageLoading(true)
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
    }
  }

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const resetTimeout = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 4000)
    }

    if (selectedImage !== null) {
      resetTimeout()
      const handleMouseMove = () => resetTimeout()
      window.addEventListener("mousemove", handleMouseMove)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        clearTimeout(timeout)
      }
    }
  }, [selectedImage])

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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-brand-primary rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-brand-text">{t("gallery.loading")}</p>
          </div>
        </div>
      </section>
    )
  }

  if (images.length === 0) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t("gallery.no_images")}</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-green-100 text-brand-text rounded-full text-sm font-semibold mb-8">
              <Camera className="h-4 w-4 mr-2 text-blue-600" />
              {t("gallery.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">{t("gallery.title")}</h2>
            <p className="text-xl text-brand-text max-w-3xl mx-auto">{t("gallery.subtitle")}</p>
          </div>

          {/* Gallery Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.title}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg leading-tight">{image.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm animate-in fade-in duration-300">
          {/* Floating Controls */}
          {showControls && (
            <>
              {/* Counter */}
              <div className="absolute top-6 left-6 z-40 px-4 py-2 bg-black/80 backdrop-blur-lg rounded-full border border-white/50 shadow-xl">
                <span className="text-white text-sm font-medium">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>

              {/* Title */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-6 py-2 bg-black/80 backdrop-blur-lg rounded-full border border-white/50 max-w-md shadow-xl">
                <span className="text-white text-sm font-medium truncate">{images[selectedImage].title}</span>
              </div>

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-40 p-3 bg-black/80 hover:bg-black/90 backdrop-blur-lg rounded-full border border-white/50 transition-all duration-200 shadow-xl"
                aria-label={t("gallery.close")}
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-black/80 hover:bg-black/90 backdrop-blur-lg rounded-full border border-white/50 transition-all duration-200 shadow-xl"
                aria-label={t("gallery.previous")}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-black/80 hover:bg-black/90 backdrop-blur-lg rounded-full border border-white/50 transition-all duration-200 shadow-xl"
                aria-label={t("gallery.next")}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>

              {/* Instructions */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-black/80 backdrop-blur-lg rounded-full border border-white/50 shadow-xl">
                <p className="text-white text-sm text-center">{t("gallery.instructions")}</p>
              </div>
            </>
          )}

          {/* Main Image Container */}
          <div className="absolute inset-0 flex items-center justify-center p-20">
            <div className="relative max-w-[70vw] max-h-[70vh] flex items-center justify-center">
              {/* Loading Spinner */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Main Image */}
              <Image
                src={images[selectedImage].url || "/placeholder.svg"}
                alt={images[selectedImage].title}
                width={1200}
                height={800}
                className={`max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl transition-all duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                priority
                onLoad={() => setImageLoading(false)}
              />
            </div>
          </div>

          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={closeLightbox} />
        </div>
      )}
    </>
  )
}
