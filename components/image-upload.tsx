"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Loader2, AlertCircle, RefreshCw, Settings, Link, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  showLabel?: boolean
}

interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  format: "jpeg" | "webp"
}

export function ImageUpload({
  value,
  onChange,
  label = "Imagen",
  placeholder = "URL de la imagen",
  required = false,
  showLabel = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"blob" | "url">("url")
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [showCompressionSettings, setShowCompressionSettings] = useState(false)
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: "jpeg",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Simplified compression using canvas with better error handling
  const compressImage = async (file: File, options: CompressionOptions): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("No se pudo crear el contexto del canvas"))
        return
      }

      const img = document.createElement("img")

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { naturalWidth: width, naturalHeight: height } = img
          const aspectRatio = width / height

          // Resize if needed
          if (width > options.maxWidth || height > options.maxHeight) {
            if (width > height) {
              width = Math.min(width, options.maxWidth)
              height = width / aspectRatio
            } else {
              height = Math.min(height, options.maxHeight)
              width = height * aspectRatio
            }
          }

          canvas.width = Math.round(width)
          canvas.height = Math.round(height)

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Try different quality levels until we get under 5MB
          const tryCompress = (quality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Error al comprimir la imagen"))
                  return
                }

                const fileName = file.name.replace(/\.[^/.]+$/, "") + "_compressed." + options.format
                const compressedFile = new File([blob], fileName, {
                  type: "image/" + options.format,
                  lastModified: Date.now(),
                })

                console.log(`Compressed with quality ${quality}: ${formatFileSize(compressedFile.size)}`)

                // If still too large and we can reduce quality further
                if (compressedFile.size > 5 * 1024 * 1024 && quality > 0.1) {
                  tryCompress(Math.max(0.1, quality - 0.1))
                } else {
                  resolve(compressedFile)
                }
              },
              "image/" + options.format,
              quality,
            )
          }

          tryCompress(options.quality)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"))
      }

      // Use FileReader to convert file to data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          img.src = event.target.result as string
        } else {
          reject(new Error("Error al leer el archivo"))
        }
      }
      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setError(null)
    setUploadProgress("Validando archivo...")

    console.log("=== ORIGINAL FILE ===")
    console.log("Name:", file.name)
    console.log("Size:", formatFileSize(file.size))
    console.log("Type:", file.type)

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      setUploadProgress("")
      return
    }

    // Validar tamaño original (máximo 50MB antes de comprimir)
    if (file.size > 50 * 1024 * 1024) {
      setError("El archivo original es demasiado grande. Máximo 50MB.")
      setUploadProgress("")
      return
    }

    if (uploadMethod === "blob") {
      let fileToUpload = file

      // Compress if file is larger than 5MB
      if (file.size > 5 * 1024 * 1024) {
        setIsCompressing(true)
        setUploadProgress("Comprimiendo imagen...")

        try {
          fileToUpload = await compressImage(file, compressionOptions)

          console.log("=== COMPRESSED FILE ===")
          console.log("Name:", fileToUpload.name)
          console.log("Size:", formatFileSize(fileToUpload.size))
          console.log("Type:", fileToUpload.type)
          console.log("Reduction:", Math.round((1 - fileToUpload.size / file.size) * 100) + "%")

          // Check if compressed file is still too large
          if (fileToUpload.size > 5 * 1024 * 1024) {
            setError(
              `La imagen comprimida sigue siendo muy grande (${formatFileSize(fileToUpload.size)}). Intenta con una imagen más pequeña o ajusta la configuración de compresión.`,
            )
            setIsCompressing(false)
            setUploadProgress("")
            return
          }
        } catch (compressionError) {
          console.error("Compression error:", compressionError)
          setError(
            "Error al comprimir la imagen: " +
              (compressionError instanceof Error ? compressionError.message : "Error desconocido"),
          )
          setIsCompressing(false)
          setUploadProgress("")
          return
        }

        setIsCompressing(false)
      }

      await uploadToBlob(fileToUpload)
    } else {
      setError("Por favor usa el método de URL externa o configura Blob storage")
      setUploadProgress("")
    }
  }

  const uploadToBlob = async (file: File) => {
    setIsUploading(true)
    setUploadProgress("Preparando subida...")

    try {
      setUploadProgress("Subiendo archivo...")

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      })

      console.log("Response status:", response.status)

      setUploadProgress("Procesando respuesta...")

      const responseText = await response.text()

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 100)}...`)
        }

        const errorMessage = errorData.suggestion
          ? `${errorData.error}: ${errorData.suggestion}`
          : errorData.error || `Upload failed with status ${response.status}`

        setError(errorMessage)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse success response:", parseError)
        throw new Error("Invalid response format from server")
      }

      if (!data.url) {
        throw new Error("No se recibió la URL de la imagen")
      }

      setUploadProgress("¡Subida completada!")
      onChange(data.url)
      setError(null)

      setTimeout(() => setUploadProgress(""), 2000)
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
      setUploadProgress("")
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
    setError(null)
    setUploadProgress("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const retryUpload = () => {
    setError(null)
    setUploadProgress("")
    if (fileInputRef.current?.files?.[0]) {
      handleFileSelect(fileInputRef.current.files[0])
    }
  }

  return (
    <div className="space-y-4">
      {showLabel && (
        <Label className="text-sm font-medium text-gray-700 flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Selector de método */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setUploadMethod("url")
            setError(null)
            setUploadProgress("")
          }}
        >
          <Link className="h-4 w-4 mr-1" />
          URL externa
        </Button>
        <Button
          type="button"
          variant={uploadMethod === "blob" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setUploadMethod("blob")
            setError(null)
            setUploadProgress("")
          }}
        >
          <Upload className="h-4 w-4 mr-1" />
          Subir archivo (compresión automática)
        </Button>
        {uploadMethod === "blob" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCompressionSettings(!showCompressionSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Configuración de compresión */}
      {showCompressionSettings && uploadMethod === "blob" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Configuración de compresión automática</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-blue-700">Ancho máximo (px)</Label>
                <Input
                  type="number"
                  value={compressionOptions.maxWidth}
                  onChange={(e) =>
                    setCompressionOptions((prev) => ({ ...prev, maxWidth: Number.parseInt(e.target.value) || 1920 }))
                  }
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-blue-700">Alto máximo (px)</Label>
                <Input
                  type="number"
                  value={compressionOptions.maxHeight}
                  onChange={(e) =>
                    setCompressionOptions((prev) => ({ ...prev, maxHeight: Number.parseInt(e.target.value) || 1080 }))
                  }
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-blue-700">
                  Calidad inicial ({Math.round(compressionOptions.quality * 100)}%)
                </Label>
                <Input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={compressionOptions.quality}
                  onChange={(e) =>
                    setCompressionOptions((prev) => ({ ...prev, quality: Number.parseFloat(e.target.value) }))
                  }
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-blue-700">Formato</Label>
                <select
                  value={compressionOptions.format}
                  onChange={(e) =>
                    setCompressionOptions((prev) => ({ ...prev, format: e.target.value as "jpeg" | "webp" }))
                  }
                  className="w-full h-8 px-2 border border-gray-300 rounded text-sm"
                >
                  <option value="jpeg">JPEG (más compatible)</option>
                  <option value="webp">WebP (mejor compresión)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              La compresión se ajustará automáticamente para mantener el archivo bajo 5MB
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress display */}
      {(uploadProgress || isCompressing) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-sm text-blue-700">{isCompressing ? "Comprimiendo imagen..." : uploadProgress}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">Error al procesar imagen</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                {uploadMethod === "blob" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={retryUpload}
                    disabled={isUploading || isCompressing}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista previa de la imagen */}
      {value && (
        <div className="relative group">
          <div className="relative aspect-[16/9] w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={value || "/placeholder.svg"}
              alt="Vista previa"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button onClick={removeImage} variant="destructive" size="sm" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click en la imagen para eliminar</p>
        </div>
      )}

      {uploadMethod === "url" ? (
        /* Input de URL */
        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Introduce una URL de imagen:</Label>
          <Input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setError(null)
              setUploadProgress("")
            }}
            placeholder={placeholder || "https://ejemplo.com/imagen.jpg"}
            disabled={isUploading || isCompressing}
          />
          <p className="text-xs text-gray-500">
            Puedes usar servicios como{" "}
            <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Imgur
            </a>
            ,{" "}
            <a
              href="https://postimages.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              PostImages
            </a>{" "}
            o{" "}
            <a
              href="https://cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Cloudinary
            </a>
          </p>
        </div>
      ) : (
        /* Área de subida de archivos */
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
              {isUploading || isCompressing ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-600">
                    {isCompressing ? "Comprimiendo imagen..." : "Subiendo imagen..."}
                  </p>
                  {uploadProgress && <p className="text-xs text-gray-500">{uploadProgress}</p>}
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">{value ? "Cambiar imagen" : "Subir imagen"}</p>
                    <p className="text-sm text-gray-600">
                      Arrastra y suelta una imagen aquí, o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, WebP (máximo 50MB original)</p>
                    <p className="text-xs text-green-600">
                      ✅ Se comprimirá automáticamente para cumplir el límite de 5MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                </>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
