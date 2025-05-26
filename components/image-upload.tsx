"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Camera, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  required?: boolean
}

export function ImageUpload({ value, onChange, label, placeholder, required = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 10MB.")
      return
    }

    setIsUploading(true)

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const { url } = await response.json()
      onChange(url)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen. Por favor intenta de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeImage = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          <Camera className="h-4 w-4 inline mr-1" />
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Vista previa de la imagen actual */}
      {value && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative">
              <Image
                src={value || "/placeholder.svg"}
                alt="Vista previa"
                width={400}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                onClick={removeImage}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 break-all">{value}</p>
          </CardContent>
        </Card>
      )}

      {/* Área de subida */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : value
              ? "border-gray-200"
              : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="p-6">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Subiendo imagen...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">{value ? "Cambiar imagen" : "Subir imagen"}</p>
                  <p className="text-sm text-gray-600">
                    Arrastra y suelta una imagen aquí, o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, WebP (máximo 10MB)</p>
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar archivo
                </Button>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </CardContent>
      </Card>

      {/* Input manual como respaldo */}
      {!value && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">O introduce una URL manualmente:</Label>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "https://ejemplo.com/imagen.jpg"}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  )
}
