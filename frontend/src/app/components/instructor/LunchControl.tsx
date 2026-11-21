import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { UtensilsCrossed, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface LunchRecord {
  fecha: string;
  preparados: number;
  entregados: number;
  desperdiciados: number;
}

export default function LunchControl() {
  const [records, setRecords] = useState<LunchRecord[]>([
    {
      fecha: "2024-12-17",
      preparados: 120,
      entregados: 115,
      desperdiciados: 5
    },
    {
      fecha: "2024-12-16",
      preparados: 110,
      entregados: 108,
      desperdiciados: 2
    },
    {
      fecha: "2024-12-15",
      preparados: 125,
      entregados: 118,
      desperdiciados: 7
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    preparados: "",
    entregados: "",
    desperdiciados: ""
  });

  const handleAddRecord = () => {
    if (!newRecord.preparados || !newRecord.entregados) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const record: LunchRecord = {
      fecha: new Date().toISOString().split("T")[0],
      preparados: parseInt(newRecord.preparados),
      entregados: parseInt(newRecord.entregados),
      desperdiciados: parseInt(newRecord.desperdiciados || "0")
    };

    setRecords([record, ...records]);
    setNewRecord({
      preparados: "",
      entregados: "",
      desperdiciados: ""
    });
    toast.success("Registro diario guardado");
  };

  const todayRecord = records[0];
  const avgPreparados = Math.round(records.reduce((sum, r) => sum + r.preparados, 0) / records.length);
  const avgEntregados = Math.round(records.reduce((sum, r) => sum + r.entregados, 0) / records.length);
  const totalDesperdiciados = records.reduce((sum, r) => sum + r.desperdiciados, 0);

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hoy - Preparados</CardDescription>
            <CardTitle className="text-3xl">{todayRecord.preparados}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hoy - Entregados</CardDescription>
            <CardTitle className="text-3xl text-green-700">{todayRecord.entregados}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hoy - Desperdicio</CardDescription>
            <CardTitle className="text-3xl text-red-700">{todayRecord.desperdiciados}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Promedio Diario</CardDescription>
            <CardTitle className="text-3xl text-sara-green-dark">{avgEntregados}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Registro diario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Control Diario
          </CardTitle>
          <CardDescription>
            Ingresa la cantidad de almuerzos del día de hoy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preparados">Almuerzos Preparados *</Label>
              <Input
                id="preparados"
                type="number"
                value={newRecord.preparados}
                onChange={(e) => setNewRecord({ ...newRecord, preparados: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entregados">Almuerzos Entregados *</Label>
              <Input
                id="entregados"
                type="number"
                value={newRecord.entregados}
                onChange={(e) => setNewRecord({ ...newRecord, entregados: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desperdiciados">Desperdicio</Label>
              <Input
                id="desperdiciados"
                type="number"
                value={newRecord.desperdiciados}
                onChange={(e) => setNewRecord({ ...newRecord, desperdiciados: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <Button
            onClick={handleAddRecord}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Guardar Registro
          </Button>
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historial de Producción
          </CardTitle>
          <CardDescription>Últimos registros de almuerzos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <UtensilsCrossed className="w-5 h-5 text-gray-600" />
                  <div>
                    <p>{new Date(record.fecha).toLocaleDateString("es-CO")}</p>
                    <p className="text-sm text-gray-600">
                      Preparados: {record.preparados} | Entregados: {record.entregados}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      record.desperdiciados <= 5
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    Desperdicio: {record.desperdiciados}
                  </Badge>
                  <Badge className="bg-sara-green-100 text-sara-green-dark">
                    Eficiencia: {Math.round((record.entregados / record.preparados) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Consumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Promedio de almuerzos preparados:</span>
            <span>{avgPreparados} por día</span>
          </div>
          <div className="flex justify-between">
            <span>Promedio de almuerzos entregados:</span>
            <span>{avgEntregados} por día</span>
          </div>
          <div className="flex justify-between">
            <span>Total desperdiciado (últimos días):</span>
            <span className="text-red-600">{totalDesperdiciados} almuerzos</span>
          </div>
          <div className="flex justify-between">
            <span>Tasa de aprovechamiento:</span>
            <span className="text-green-600">
              {Math.round((avgEntregados / avgPreparados) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
