"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

interface ExcursionGalleryProps {
  mainImage: string
  galleryImages?: string[]
  altText: string
}

export function ExcursionGallery({ mainImage, galleryImages = [], altText }: ExcursionGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const allImages = [mainImage, ...galleryImages]

  const openLightbox = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % allImages.length
    setCurrentIndex(nextIndex)
    setSelectedImage(allImages[nextIndex])
  }

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length
    setCurrentIndex(prevIndex)
    setSelectedImage(allImages[prevIndex])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox()
    if (e.key === "ArrowRight") nextImage()
    if (e.key === "ArrowLeft") prevImage()
  }

  return (
    <>
      <div className="space-y-4">
        {/* Imagen principal */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative group">
              <Image
                src={mainImage || "/placeholder.svg"}
                alt={altText}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover"
              />
              <button
                onClick={() => openLightbox(mainImage, 0)}
                className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <Maximize2 className="h-8 w-8 text-white" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Galería de imágenes adicionales */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.slice(0, 6).map((imageUrl, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative group">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={`${altText} - Imagen ${index + 2}`}
                      width={200}
                      height={150}
                      className="w-full h-24 md:h-32 object-cover"
                    />
                    <button
                      onClick={() => openLightbox(imageUrl, index + 1)}
                      className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <Maximize2 className="h-6 w-6 text-white" />
                    </button>

                    {/* Mostrar indicador "+X más" en la última imagen si hay más de 6 */}
                    {index === 5 && galleryImages.length > 6 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold">+{galleryImages.length - 6}</div>
                          <div className="text-sm">más fotos</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt={altText}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Controles */}
            <Button
              onClick={closeLightbox}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>

            {allImages.length > 1 && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Contador */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
