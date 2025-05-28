"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, Camera, Upload, ImageIcon } from "lucide-react"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 flex items-center">
          <Camera className="h-4 w-4 mr-2 text-blue-600" />
          {label}
        </Label>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {value.length}/{maxImages} imágenes
        </div>
      </div>

      {/* Imágenes existentes */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={index} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Overlay con botones */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => removeImage(index)}
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Número de imagen */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {index + 1}
                  </div>

                  {/* Indicador de calidad */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ✓
                  </div>
                </div>

                {/* Información de la imagen */}
                <div className="p-3 bg-white">
                  <p className="text-xs text-gray-600 font-medium">Imagen {index + 1}</p>
                  <p className="text-xs text-gray-400 mt-1">Click para eliminar</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Botón para añadir nueva imagen */}
      {value.length < maxImages && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-300">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Añadir imagen {value.length + 1}</h3>
                <p className="text-sm text-gray-600">Sube una imagen de alta calidad para la galería</p>
              </div>

              <ImageUpload
                value=""
                onChange={addImage}
                label=""
                placeholder="Subir nueva imagen para la galería"
                showLabel={false}
              />

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Formato recomendado: JPG, PNG</p>
                <p>• Tamaño mínimo: 800x600px</p>
                <p>• Relación de aspecto: 4:3 (recomendado)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado cuando se alcanza el límite */}
      {value.length >= maxImages && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">¡Galería completa!</h3>
            <p className="text-sm text-green-700">
              Has alcanzado el límite máximo de {maxImages} imágenes para la galería.
            </p>
            <p className="text-xs text-green-600 mt-2">Puedes eliminar imágenes existentes para añadir nuevas.</p>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {value.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin imágenes en la galería</h3>
            <p className="text-gray-600 mb-6">
              Añade hasta {maxImages} imágenes para crear una galería atractiva de tu excursión
            </p>
            <ImageUpload
              value=""
              onChange={addImage}
              label=""
              placeholder="Subir primera imagen de la galería"
              showLabel={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
