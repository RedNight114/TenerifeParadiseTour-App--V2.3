"use client"

import { useState, useEffect } from "react"
import { Settings, Shield, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export function AdminAccess() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Verificar si hay una sesión de admin guardada
    const adminSession = localStorage.getItem("admin_session")
    if (adminSession === "active") {
      setIsAdmin(true)
      setIsVisible(true)
    }

    // Combinación de teclas para mostrar/ocultar (Ctrl + Shift + A)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault()
        if (!isAdmin) {
          // Prompt para contraseña de admin
          const password = prompt("Contraseña de administrador:")
          if (password === "TenerifeAdmin2025") {
            setIsAdmin(true)
            setIsVisible(true)
            localStorage.setItem("admin_session", "active")
          } else if (password !== null) {
            alert("Contraseña incorrecta")
          }
        } else {
          setIsVisible(!isVisible)
        }
      }
    }

    // Triple click en el logo para acceso rápido
    let clickCount = 0
    let clickTimer: NodeJS.Timeout

    const handleTripleClick = () => {
      clickCount++
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0
        }, 500)
      } else if (clickCount === 3) {
        clearTimeout(clickTimer)
        clickCount = 0
        if (!isAdmin) {
          const password = prompt("Contraseña de administrador:")
          if (password === "TenerifeAdmin2025") {
            setIsAdmin(true)
            setIsVisible(true)
            localStorage.setItem("admin_session", "active")
          }
        } else {
          setIsVisible(!isVisible)
        }
      }
    }

    // Añadir event listeners
    document.addEventListener("keydown", handleKeyPress)

    // Buscar el logo y añadir el event listener
    const logo = document.querySelector('img[alt*="TenerifeParadiseTours"]')
    if (logo) {
      logo.addEventListener("click", handleTripleClick)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      if (logo) {
        logo.removeEventListener("click", handleTripleClick)
      }
      if (clickTimer) {
        clearTimeout(clickTimer)
      }
    }
  }, [isAdmin])

  const handleLogout = () => {
    setIsAdmin(false)
    setIsVisible(false)
    localStorage.removeItem("admin_session")
  }

  if (!isAdmin) return null

  return (
    <>
      {/* Botón flotante principal */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Panel Admin</h3>
                <p className="text-xs text-gray-500">Acceso de administrador</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                title="Minimizar panel"
              >
                <EyeOff className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Botones de acceso */}
          <div className="space-y-2">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Link href="/admin/manage-excursions" className="flex items-center justify-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Gestionar Excursiones</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300"
            >
              <Link href="/admin/excursion-form" className="flex items-center justify-center space-x-2">
                <span>➕</span>
                <span>Nueva Excursión</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              <Link href="/admin/categories" className="flex items-center justify-center space-x-2">
                <span>🏷️</span>
                <span>Categorías</span>
              </Link>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-500">Ctrl+Shift+A para alternar</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Indicador discreto cuando está oculto */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 z-40 group cursor-pointer"
          title="Mostrar panel de administración"
        >
          <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full animate-pulse shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Eye className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
          </div>
        </button>
      )}
    </>
  )
}
