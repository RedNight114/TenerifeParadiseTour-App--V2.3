"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, Camera } from "lucide-react"
import Image from "next/image"
import { ImageUpload } from "./image-upload"

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
  maxImages?: number
}

export function MultiImageUpload({
  value = [],
  onChange,
  label = "Galería de Imágenes",
  maxImages = 6,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const addImage = (url: string) => {
    if (value.length < maxImages) {
      onChange([...value, url])
    }
  }

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const updateImage = (index: number, url: string) => {
    const newImages = [...value]
    newImages[index] = url
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700">
        <Camera className="h-4 w-4 inline mr-1" />
        {label} ({value.length}/{maxImages})
      </Label>

      {/* Imágenes existentes */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-3">
                <div className="relative">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => removeImage(index)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">Imagen {index + 1}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Botón para añadir nueva imagen */}
      {value.length < maxImages && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-6">
            <ImageUpload
              value=""
              onChange={addImage}
              label={`Añadir imagen ${value.length + 1}`}
              placeholder="Subir nueva imagen para la galería"
            />
          </CardContent>
        </Card>
      )}

      {value.length >= maxImages && (
        <p className="text-sm text-gray-500 text-center">Has alcanzado el límite máximo de {maxImages} imágenes</p>
      )}
    </div>
  )
}
