import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ClipboardList, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Complaint {
  id: string;
  ficha: string;
  fecha: string;
  tipo: "reclamacion" | "devolucion" | "sugerencia";
  motivo: string;
  descripcion: string;
  estado: "pendiente" | "en-proceso" | "resuelta";
}

interface ComplaintsViewProps {
  userFicha: string;
}

export default function ComplaintsView({ userFicha }: ComplaintsViewProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "1",
      ficha: userFicha,
      fecha: "2024-12-16",
      tipo: "sugerencia",
      motivo: "Variedad de menú",
      descripcion: "Me gustaría que hubiera más opciones vegetarianas",
      estado: "resuelta"
    }
  ]);

  const [newComplaint, setNewComplaint] = useState({
    tipo: "reclamacion" as "reclamacion" | "devolucion" | "sugerencia",
    motivo: "",
    descripcion: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComplaint.motivo || !newComplaint.descripcion) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const complaint: Complaint = {
      id: Date.now().toString(),
      ficha: userFicha,
      fecha: new Date().toISOString().split("T")[0],
      tipo: newComplaint.tipo,
      motivo: newComplaint.motivo,
      descripcion: newComplaint.descripcion,
      estado: "pendiente"
    };

    setComplaints([complaint, ...complaints]);
    setNewComplaint({
      tipo: "reclamacion",
      motivo: "",
      descripcion: ""
    });
    
    toast.success("Reclamación enviada correctamente", {
      description: "El instructor la revisará pronto"
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-yellow-600">Pendiente</Badge>;
      case "en-proceso":
        return <Badge className="bg-sara-green">En Proceso</Badge>;
      case "resuelta":
        return <Badge className="bg-green-600">Resuelta</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "reclamacion":
        return <Badge variant="outline" className="border-red-600 text-red-600">Reclamación</Badge>;
      case "devolucion":
        return <Badge variant="outline" className="border-orange-600 text-orange-600">Devolución</Badge>;
      case "sugerencia":
        return <Badge variant="outline" className="border-sara-green text-sara-green-dark">Sugerencia</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const pendientesCount = complaints.filter(c => c.estado === "pendiente").length;
  const procesoCount = complaints.filter(c => c.estado === "en-proceso").length;
  const resueltasCount = complaints.filter(c => c.estado === "resuelta").length;

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-700">{pendientesCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En Proceso</CardDescription>
            <CardTitle className="text-3xl text-sara-green-dark">{procesoCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resueltas</CardDescription>
            <CardTitle className="text-3xl text-green-700">{resueltasCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Formulario para nueva reclamación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F27C00' }}>
            <Send className="w-5 h-5" />
            Enviar Nueva Reclamación
          </CardTitle>
          <CardDescription>
            Cuéntanos sobre tu experiencia o sugerencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Reclamación</Label>
              <Select
                value={newComplaint.tipo}
                onValueChange={(value: "reclamacion" | "devolucion" | "sugerencia") =>
                  setNewComplaint({ ...newComplaint, tipo: value })
                }
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reclamacion">Reclamación</SelectItem>
                  <SelectItem value="devolucion">Devolución</SelectItem>
                  <SelectItem value="sugerencia">Sugerencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                value={newComplaint.motivo}
                onChange={(e) => setNewComplaint({ ...newComplaint, motivo: e.target.value })}
                placeholder="Ej: Porción pequeña, Calidad del alimento, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada</Label>
              <Textarea
                id="descripcion"
                value={newComplaint.descripcion}
                onChange={(e) => setNewComplaint({ ...newComplaint, descripcion: e.target.value })}
                placeholder="Describe tu experiencia o sugerencia con el mayor detalle posible..."
                rows={4}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              style={{ backgroundColor: '#F27C00' }}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Reclamación
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mis reclamaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mis Reclamaciones
          </CardTitle>
          <CardDescription>
            Historial de reclamaciones y sugerencias enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2">
                      {getTipoBadge(complaint.tipo)}
                      {getEstadoBadge(complaint.estado)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(complaint.fecha).toLocaleDateString("es-CO")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        {complaint.motivo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{complaint.descripcion}</p>
                    </div>
                  </div>

                  {complaint.estado === "pendiente" && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⏳ Tu reclamación está pendiente de revisión
                      </p>
                    </div>
                  )}
                  {complaint.estado === "en-proceso" && (
                    <div className="mt-4 bg-sara-green-50 border border-sara-green-100 rounded-lg p-3">
                      <p className="text-sm text-sara-green-dark">
                        Tu reclamación está siendo procesada
                      </p>
                    </div>
                  )}
                  {complaint.estado === "resuelta" && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        Tu reclamación ha sido resuelta
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {complaints.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No has enviado ninguna reclamación todavía
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sara-green-dark" />
            ¿Cuándo usar este sistema?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Reclamación:</strong> Cuando el servicio o producto no cumple con tus expectativas</p>
          <p><strong>Devolución:</strong> Cuando hay un problema con la calidad del alimento</p>
          <p><strong>Sugerencia:</strong> Ideas para mejorar el servicio del restaurante</p>
          <p className="mt-4 text-sara-green-dark">
            Tu opinión nos ayuda a mejorar constantemente el servicio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
