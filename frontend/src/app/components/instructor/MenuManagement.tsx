import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Calendar, Save, History, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  tipo: "sopa" | "plato-fuerte" | "ensalada" | "bebida";
  nombre: string;
  ingredientes: string;
}

interface Menu {
  fecha: string;
  items: MenuItem[];
}

export default function MenuManagement() {
  const [currentMenu, setCurrentMenu] = useState<MenuItem[]>([
    {
      tipo: "sopa",
      nombre: "Sopa de verduras",
      ingredientes: "Zanahoria, Papa, Apio, Cilantro, Pollo"
    },
    {
      tipo: "plato-fuerte",
      nombre: "Pollo al horno con arroz",
      ingredientes: "Pollo, Arroz, Plátano maduro, Frijoles"
    },
    {
      tipo: "ensalada",
      nombre: "Ensalada mixta",
      ingredientes: "Lechuga, Tomate, Cebolla, Limón"
    },
    {
      tipo: "bebida",
      nombre: "Jugo de mora",
      ingredientes: "Mora, Agua, Panela"
    }
  ]);

  const [menuHistory, setMenuHistory] = useState<Menu[]>([
    {
      fecha: "2024-12-16",
      items: [
        { tipo: "sopa", nombre: "Sancocho", ingredientes: "Yuca, Papa, Plátano, Pollo" },
        { tipo: "plato-fuerte", nombre: "Carne Asada", ingredientes: "Carne, Arroz, Ensalada" },
        { tipo: "ensalada", nombre: "Ensalada Verde", ingredientes: "Lechuga, Pepino" },
        { tipo: "bebida", nombre: "Limonada", ingredientes: "Limón, Agua, Azúcar" }
      ]
    }
  ]);

  const [showHistory, setShowHistory] = useState(false);

  const handleItemChange = (index: number, field: "nombre" | "ingredientes", value: string) => {
    const updated = [...currentMenu];
    updated[index][field] = value;
    setCurrentMenu(updated);
  };

  const handleSaveMenu = () => {
    const newMenu: Menu = {
      fecha: new Date().toISOString().split("T")[0],
      items: currentMenu
    };

    setMenuHistory([newMenu, ...menuHistory]);
    toast.success("Menú guardado exitosamente", {
      description: "Los aprendices ahora pueden ver el menú actualizado"
    });
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "sopa": return "Sopa";
      case "plato-fuerte": return "Plato Fuerte";
      case "ensalada": return "Ensalada";
      case "bebida": return "Bebida";
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "sopa": return "bg-sara-green-100 text-sara-green-dark";
      case "plato-fuerte": return "bg-orange-100 text-orange-700";
      case "ensalada": return "bg-green-100 text-green-700";
      case "bebida": return "bg-sara-orange-100 text-sara-orange-dark";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Acciones rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Gestión de Menú Diario</h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString("es-CO", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? "Ocultar Historial" : "Ver Historial"}
          </Button>
          <Button
            onClick={handleSaveMenu}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Publicar Menú
          </Button>
        </div>
      </div>

      {/* Alerta de disponibilidad */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-sara-green-dark flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>El menú se ajusta automáticamente según la disponibilidad de ingredientes en el inventario.</p>
              <p className="mt-1">Verifica que todos los ingredientes estén disponibles antes de publicar.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario del menú */}
      <div className="grid md:grid-cols-2 gap-4">
        {currentMenu.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getTipoLabel(item.tipo)}</CardTitle>
                <Badge className={getTipoColor(item.tipo)}>
                  {getTipoLabel(item.tipo)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Plato</Label>
                <Input
                  value={item.nombre}
                  onChange={(e) => handleItemChange(index, "nombre", e.target.value)}
                  placeholder="Ej: Sopa de verduras"
                />
              </div>
              <div className="space-y-2">
                <Label>Ingredientes</Label>
                <Textarea
                  value={item.ingredientes}
                  onChange={(e) => handleItemChange(index, "ingredientes", e.target.value)}
                  placeholder="Separa los ingredientes con comas"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historial de menús */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Menús
            </CardTitle>
            <CardDescription>
              Consulta los menús anteriores para planificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuHistory.map((menu, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>{new Date(menu.fecha).toLocaleDateString("es-CO")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {menu.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Badge className={`${getTipoColor(item.tipo)} text-xs`}>
                          {getTipoLabel(item.tipo)}
                        </Badge>
                        <span>{item.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planificación semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Planificación Semanal</CardTitle>
          <CardDescription>
            Pre-menú para los próximos días (sujeto a disponibilidad)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Funcionalidad de pre-menú semanal - Permite planificar con anticipación y ajustar según llegada de insumos
          </p>
          <Button variant="outline" className="mt-4">
            <Calendar className="w-4 h-4 mr-2" />
            Crear Pre-menú Semanal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
