import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Soup, UtensilsCrossed, Salad, Coffee, Calendar } from "lucide-react";

export default function MenuView() {
  // Mock data - En producción vendría de una base de datos
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const menu = {
    fecha: today,
    sopa: {
      nombre: "Sopa de verduras",
      ingredientes: ["Zanahoria", "Papa", "Apio", "Cilantro", "Pollo"]
    },
    platoFuerte: {
      nombre: "Pollo al horno con arroz",
      ingredientes: ["Pollo", "Arroz", "Plátano maduro", "Frijoles"]
    },
    ensalada: {
      nombre: "Ensalada mixta",
      ingredientes: ["Lechuga", "Tomate", "Cebolla", "Limón"]
    },
    bebida: {
      nombre: "Jugo de mora",
      ingredientes: ["Mora", "Agua", "Panela"]
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-sara-green" />
            <Badge>Menú de hoy</Badge>
          </div>
          <CardTitle>Menú del día</CardTitle>
          <CardDescription className="first-letter:uppercase">{menu.fecha}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Sopa */}
            <Card className="bg-sara-green-50 border-sara-green-100 border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: "#39A900" }}><Soup className="w-5 h-5" /></span><span className="flex flex-col"><span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#39A900" }}>Sopa</span>
                  <CardTitle className="text-lg">{menu.sopa.nombre}</CardTitle></span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Ingredientes</p>
                <div className="flex flex-wrap gap-1">
                  {menu.sopa.ingredientes.map((ing, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plato Fuerte */}
            <Card className="bg-sara-orange-50 border-sara-orange-100 border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: "#F27C00" }}><UtensilsCrossed className="w-5 h-5" /></span><span className="flex flex-col"><span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#F27C00" }}>Plato fuerte</span>
                  <CardTitle className="text-lg">{menu.platoFuerte.nombre}</CardTitle></span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Ingredientes</p>
                <div className="flex flex-wrap gap-1">
                  {menu.platoFuerte.ingredientes.map((ing, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ensalada */}
            <Card className="bg-sara-green-50 border-sara-green-100 border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: "#39A900" }}><Salad className="w-5 h-5" /></span><span className="flex flex-col"><span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#39A900" }}>Acompañante</span>
                  <CardTitle className="text-lg">{menu.ensalada.nombre}</CardTitle></span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Ingredientes</p>
                <div className="flex flex-wrap gap-1">
                  {menu.ensalada.ingredientes.map((ing, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bebida */}
            <Card className="bg-sara-orange-50 border-sara-orange-100 border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: "#F27C00" }}><Coffee className="w-5 h-5" /></span><span className="flex flex-col"><span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#F27C00" }}>Bebida</span>
                  <CardTitle className="text-lg">{menu.bebida.nombre}</CardTitle></span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Ingredientes</p>
                <div className="flex flex-wrap gap-1">
                  {menu.bebida.ingredientes.map((ing, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="bg-orange-100 p-2 rounded">
              <UtensilsCrossed className="w-4 h-4 text-sara-orange" />
            </div>
            <div>
              <p className="text-sm">Horario de atención: 12:00 m. a 1:30 p. m.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-green-100 p-2 rounded">
              <Calendar className="w-4 h-4 text-sara-green" />
            </div>
            <div>
              <p className="text-sm">El menú se actualiza diariamente según disponibilidad de ingredientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
