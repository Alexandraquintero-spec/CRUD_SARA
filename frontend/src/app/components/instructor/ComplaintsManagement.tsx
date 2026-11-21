import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ClipboardList, Plus, AlertCircle, CheckCircle } from "lucide-react";
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

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "1",
      ficha: "2891234",
      fecha: "2024-12-17",
      tipo: "reclamacion",
      motivo: "Porción pequeña",
      descripcion: "La porción del almuerzo fue menor a lo habitual",
      estado: "resuelta"
    },
    {
      id: "2",
      ficha: "2891235",
      fecha: "2024-12-17",
      tipo: "devolucion",
      motivo: "Alimento en mal estado",
      descripcion: "La ensalada tenía lechuga marchita",
      estado: "en-proceso"
    },
    {
      id: "3",
      ficha: "2891236",
      fecha: "2024-12-16",
      tipo: "sugerencia",
      motivo: "Variedad de menú",
      descripcion: "Sería bueno tener más opciones vegetarianas",
      estado: "pendiente"
    }
  ]);

  const [newComplaint, setNewComplaint] = useState({
    ficha: "",
    tipo: "reclamacion" as "reclamacion" | "devolucion" | "sugerencia",
    motivo: "",
    descripcion: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>("todas");

  const handleAddComplaint = () => {
    if (!newComplaint.ficha || !newComplaint.motivo || !newComplaint.descripcion) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const complaint: Complaint = {
      id: Date.now().toString(),
      ficha: newComplaint.ficha,
      fecha: new Date().toISOString().split("T")[0],
      tipo: newComplaint.tipo,
      motivo: newComplaint.motivo,
      descripcion: newComplaint.descripcion,
      estado: "pendiente"
    };

    setComplaints([complaint, ...complaints]);
    setNewComplaint({
      ficha: "",
      tipo: "reclamacion",
      motivo: "",
      descripcion: ""
    });
    setIsDialogOpen(false);
    toast.success("Reclamación registrada exitosamente");
  };

  const handleUpdateStatus = (id: string, newStatus: "pendiente" | "en-proceso" | "resuelta") => {
    setComplaints(complaints.map(c => 
      c.id === id ? { ...c, estado: newStatus } : c
    ));
    toast.success(`Estado actualizado a: ${newStatus}`);
  };

  const filteredComplaints = complaints.filter(c => 
    filterEstado === "todas" || c.estado === filterEstado
  );

  const totalPendientes = complaints.filter(c => c.estado === "pendiente").length;
  const totalEnProceso = complaints.filter(c => c.estado === "en-proceso").length;
  const totalResueltas = complaints.filter(c => c.estado === "resuelta").length;

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

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Registros</CardDescription>
            <CardTitle className="text-3xl">{complaints.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-700">{totalPendientes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En Proceso</CardDescription>
            <CardTitle className="text-3xl text-sara-green-dark">{totalEnProceso}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resueltas</CardDescription>
            <CardTitle className="text-3xl text-green-700">{totalResueltas}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Formulario y lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Gestión de Reclamaciones
              </CardTitle>
              <CardDescription>
                Registro y seguimiento de reclamaciones, devoluciones y sugerencias
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Reclamación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Reclamación</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles de la reclamación o sugerencia
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ficha">Número de Ficha</Label>
                    <Input
                      id="ficha"
                      value={newComplaint.ficha}
                      onChange={(e) => setNewComplaint({ ...newComplaint, ficha: e.target.value })}
                      placeholder="Ej: 2891234"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={newComplaint.tipo}
                      onValueChange={(value: "reclamacion" | "devolucion" | "sugerencia") =>
                        setNewComplaint({ ...newComplaint, tipo: value })
                      }
                    >
                      <SelectTrigger>
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
                      placeholder="Ej: Porción pequeña"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción Detallada</Label>
                    <Textarea
                      id="descripcion"
                      value={newComplaint.descripcion}
                      onChange={(e) => setNewComplaint({ ...newComplaint, descripcion: e.target.value })}
                      placeholder="Describe la situación..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleAddComplaint} className="w-full bg-orange-600 hover:bg-orange-700">
                    Registrar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              variant={filterEstado === "todas" ? "default" : "outline"}
              onClick={() => setFilterEstado("todas")}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filterEstado === "pendiente" ? "default" : "outline"}
              onClick={() => setFilterEstado("pendiente")}
              size="sm"
              className={filterEstado === "pendiente" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              Pendientes
            </Button>
            <Button
              variant={filterEstado === "en-proceso" ? "default" : "outline"}
              onClick={() => setFilterEstado("en-proceso")}
              size="sm"
              className={filterEstado === "en-proceso" ? "bg-sara-green hover:bg-sara-green-dark" : ""}
            >
              En Proceso
            </Button>
            <Button
              variant={filterEstado === "resuelta" ? "default" : "outline"}
              onClick={() => setFilterEstado("resuelta")}
              size="sm"
              className={filterEstado === "resuelta" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Resueltas
            </Button>
          </div>

          {/* Lista de reclamaciones */}
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Ficha:</span>
                      <span>{complaint.ficha}</span>
                    </div>
                    <div>
                      <p className="text-sm">
                        <strong>Motivo:</strong> {complaint.motivo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{complaint.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {complaint.estado !== "pendiente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(complaint.id, "pendiente")}
                      >
                        Marcar Pendiente
                      </Button>
                    )}
                    {complaint.estado !== "en-proceso" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(complaint.id, "en-proceso")}
                      >
                        En Proceso
                      </Button>
                    )}
                    {complaint.estado !== "resuelta" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateStatus(complaint.id, "resuelta")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay reclamaciones con el filtro seleccionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Beneficios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-700" />
            Mejora Continua del Servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Registro sistemático de todas las reclamaciones y sugerencias</p>
          <p>Seguimiento del estado de cada caso hasta su resolución</p>
          <p>Identificación de patrones para mejora del servicio</p>
          <p>Transparencia en el proceso de atención al usuario</p>
          <p>Base de datos para análisis de calidad del servicio</p>
        </CardContent>
      </Card>
    </div>
  );
}
