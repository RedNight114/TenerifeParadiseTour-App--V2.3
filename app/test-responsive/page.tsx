"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, RotateCcw } from "lucide-react"

const devices = [
  // iPhones
  { name: "iPhone SE", width: 375, height: 667, category: "iPhone" },
  { name: "iPhone 12/13/14", width: 390, height: 844, category: "iPhone" },
  { name: "iPhone 12/13/14 Pro", width: 393, height: 852, category: "iPhone" },
  { name: "iPhone 14 Plus", width: 428, height: 926, category: "iPhone" },
  { name: "iPhone 14 Pro Max", width: 430, height: 932, category: "iPhone" },

  // Android
  { name: "Samsung Galaxy S8", width: 360, height: 740, category: "Android" },
  { name: "Samsung Galaxy S20", width: 360, height: 800, category: "Android" },
  { name: "Google Pixel 5", width: 393, height: 851, category: "Android" },
  { name: "OnePlus 8", width: 412, height: 915, category: "Android" },

  // Tablets
  { name: "iPad Mini", width: 768, height: 1024, category: "Tablet" },
  { name: "iPad Air", width: 820, height: 1180, category: "Tablet" },
  { name: 'iPad Pro 11"', width: 834, height: 1194, category: "Tablet" },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: "Tablet" },
  { name: "Samsung Galaxy Tab", width: 800, height: 1280, category: "Tablet" },

  // Desktop
  { name: "Desktop Small", width: 1024, height: 768, category: "Desktop" },
  { name: "Desktop Medium", width: 1366, height: 768, category: "Desktop" },
  { name: "Desktop Large", width: 1920, height: 1080, category: "Desktop" },
]

export default function ResponsiveTestPage() {
  const [selectedDevice, setSelectedDevice] = useState(devices[1]) // iPhone 12/13/14 por defecto
  const [isLandscape, setIsLandscape] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const currentWidth = isLandscape ? selectedDevice.height : selectedDevice.width
  const currentHeight = isLandscape ? selectedDevice.width : selectedDevice.height

  const filteredDevices =
    selectedCategory === "all" ? devices : devices.filter((device) => device.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "iPhone":
      case "Android":
        return <Smartphone className="h-4 w-4" />
      case "Tablet":
        return <Tablet className="h-4 w-4" />
      case "Desktop":
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "iPhone":
        return "bg-blue-100 text-blue-800"
      case "Android":
        return "bg-green-100 text-green-800"
      case "Tablet":
        return "bg-purple-100 text-purple-800"
      case "Desktop":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Prueba de Responsividad - Tenerife Paradise Tours</h1>
          <p className="text-gray-600">Visualiza cómo se ve la página de inicio en diferentes dispositivos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dispositivo Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{selectedDevice.name}</p>
                    <p className="text-sm text-gray-600">
                      {currentWidth} × {currentHeight}px
                    </p>
                  </div>
                  <Badge className={getCategoryColor(selectedDevice.category)}>
                    {getCategoryIcon(selectedDevice.category)}
                    <span className="ml-1">{selectedDevice.category}</span>
                  </Badge>
                </div>

                <Button variant="outline" onClick={() => setIsLandscape(!isLandscape)} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isLandscape ? "Vertical" : "Horizontal"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtrar por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["all", "iPhone", "Android", "Tablet", "Desktop"].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full justify-start"
                      size="sm"
                    >
                      {category !== "all" && getCategoryIcon(category)}
                      <span className={category !== "all" ? "ml-2" : ""}>
                        {category === "all" ? "Todos" : category}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seleccionar Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredDevices.map((device) => (
                    <Button
                      key={device.name}
                      variant={selectedDevice.name === device.name ? "default" : "outline"}
                      onClick={() => setSelectedDevice(device)}
                      className="w-full justify-start text-left"
                      size="sm"
                    >
                      <div className="flex items-center w-full">
                        {getCategoryIcon(device.category)}
                        <div className="ml-2 flex-1">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-xs text-gray-500">
                            {device.width} × {device.height}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Vista Previa
                  <Badge variant="outline">Escala: {Math.min(1, 800 / currentWidth).toFixed(2)}x</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-200 p-4 rounded-lg overflow-auto">
                  <div
                    className="bg-white shadow-lg mx-auto"
                    style={{
                      width: `${Math.min(currentWidth, 800)}px`,
                      height: `${Math.min(currentHeight, 600)}px`,
                      transform: currentWidth > 800 ? `scale(${800 / currentWidth})` : "none",
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      src="/"
                      className="w-full h-full border-0"
                      style={{
                        width: `${currentWidth}px`,
                        height: `${currentHeight}px`,
                        transform: currentWidth > 800 ? `scale(${800 / currentWidth})` : "none",
                        transformOrigin: "top left",
                      }}
                      title={`Vista previa en ${selectedDevice.name}`}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Puntos de Verificación:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Sin scroll horizontal</li>
                    <li>✓ Texto legible en todos los tamaños</li>
                    <li>✓ Botones accesibles con el dedo</li>
                    <li>✓ Imágenes que se adaptan correctamente</li>
                    <li>✓ Navegación funcional</li>
                    <li>✓ Espaciado apropiado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Móviles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">Resoluciones más comunes en dispositivos móviles</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>iPhone SE</span>
                  <span className="text-gray-500">375px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>iPhone 12-14</span>
                  <span className="text-gray-500">390px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Android típico</span>
                  <span className="text-gray-500">360-412px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Tablet className="h-5 w-5 mr-2" />
                Tablets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">Resoluciones típicas en tablets</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>iPad Mini</span>
                  <span className="text-gray-500">768px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>iPad Air</span>
                  <span className="text-gray-500">820px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>iPad Pro</span>
                  <span className="text-gray-500">834-1024px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Desktop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">Resoluciones de escritorio más comunes</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pequeño</span>
                  <span className="text-gray-500">1024px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mediano</span>
                  <span className="text-gray-500">1366px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Grande</span>
                  <span className="text-gray-500">1920px+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
