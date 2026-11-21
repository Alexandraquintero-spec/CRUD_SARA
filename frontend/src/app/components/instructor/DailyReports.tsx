import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { FileText, Download, Calendar, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";

interface DailyRecord {
  fecha: string;
  dia: string;
  preparados: number;
  vendidos: number;
  desperdicio: number;
  ingresos: number;
  aforoPromedio: number;
  aforoMaximo: number;
}

export default function DailyReports() {
  const [reportPeriod, setReportPeriod] = useState<"dia" | "semana" | "mes">("dia");

  // Datos del día actual
  const todayData: DailyRecord = {
    fecha: "2024-12-17",
    dia: "Mar",
    preparados: 125,
    vendidos: 118,
    desperdicio: 7,
    ingresos: 590000,
    aforoPromedio: 68,
    aforoMaximo: 95
  };

  // Datos de la semana
  const weekData: DailyRecord[] = [
    {
      fecha: "2024-12-16",
      dia: "Lun",
      preparados: 120,
      vendidos: 115,
      desperdicio: 5,
      ingresos: 575000,
      aforoPromedio: 65,
      aforoMaximo: 88
    },
    {
      fecha: "2024-12-17",
      dia: "Mar",
      preparados: 125,
      vendidos: 118,
      desperdicio: 7,
      ingresos: 590000,
      aforoPromedio: 68,
      aforoMaximo: 95
    },
    {
      fecha: "2024-12-18",
      dia: "Mié",
      preparados: 110,
      vendidos: 108,
      desperdicio: 2,
      ingresos: 540000,
      aforoPromedio: 62,
      aforoMaximo: 82
    },
    {
      fecha: "2024-12-19",
      dia: "Jue",
      preparados: 115,
      vendidos: 112,
      desperdicio: 3,
      ingresos: 560000,
      aforoPromedio: 64,
      aforoMaximo: 85
    },
    {
      fecha: "2024-12-20",
      dia: "Vie",
      preparados: 130,
      vendidos: 125,
      desperdicio: 5,
      ingresos: 625000,
      aforoPromedio: 72,
      aforoMaximo: 98
    }
  ];

  // Datos mensuales (por semana)
  const monthData = [
    { semana: "Semana 1", preparados: 580, vendidos: 565, ingresos: 2825000 },
    { semana: "Semana 2", preparados: 600, vendidos: 588, ingresos: 2940000 },
    { semana: "Semana 3", preparados: 610, vendidos: 595, ingresos: 2975000 },
    { semana: "Semana 4", preparados: 590, vendidos: 578, ingresos: 2890000 }
  ];

  const handleExportReport = () => {
    toast.success("Reporte descargado", {
      description: "El archivo PDF se ha guardado en tu dispositivo"
    });
  };

  const calculateTotals = (data: DailyRecord[]) => {
    return {
      totalPreparados: data.reduce((sum, d) => sum + d.preparados, 0),
      totalVendidos: data.reduce((sum, d) => sum + d.vendidos, 0),
      totalDesperdicio: data.reduce((sum, d) => sum + d.desperdicio, 0),
      totalIngresos: data.reduce((sum, d) => sum + d.ingresos, 0),
      promedioAforo: Math.round(data.reduce((sum, d) => sum + d.aforoPromedio, 0) / data.length)
    };
  };

  const weekTotals = calculateTotals(weekData);
  const monthTotals = {
    totalPreparados: monthData.reduce((sum, d) => sum + d.preparados, 0),
    totalVendidos: monthData.reduce((sum, d) => sum + d.vendidos, 0),
    totalIngresos: monthData.reduce((sum, d) => sum + d.ingresos, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card style={{ borderColor: '#39A900', background: 'linear-gradient(to right, #E8F5E9, white)' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" style={{ color: '#00543A' }}>
                Reportes e Historial
              </CardTitle>
              <CardDescription className="capitalize mt-1">
                Sistema de análisis SARA
              </CardDescription>
            </div>
            <Button onClick={handleExportReport} style={{ backgroundColor: '#39A900' }} className="hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Selector de período */}
      <Tabs value={reportPeriod} onValueChange={(v) => setReportPeriod(v as "dia" | "semana" | "mes")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dia">
            <Clock className="w-4 h-4 mr-2" />
            Hoy
          </TabsTrigger>
          <TabsTrigger value="semana">
            <Calendar className="w-4 h-4 mr-2" />
            Esta Semana
          </TabsTrigger>
          <TabsTrigger value="mes">
            <TrendingUp className="w-4 h-4 mr-2" />
            Este Mes
          </TabsTrigger>
        </TabsList>

        {/* REPORTE DIARIO */}
        <TabsContent value="dia" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Almuerzos Preparados</CardDescription>
                <CardTitle className="text-3xl">{todayData.preparados}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Almuerzos Vendidos</CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#00543A' }}>{todayData.vendidos}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Aforo Máximo</CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#F27C00' }}>{todayData.aforoMaximo}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Ingresos</CardDescription>
                <CardTitle className="text-xl text-sara-green-dark">
                  ${todayData.ingresos.toLocaleString("es-CO")}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Día</CardTitle>
              <CardDescription>{new Date(todayData.fecha).toLocaleDateString("es-CO", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Tasa de aprovechamiento:</span>
                  <Badge style={{ backgroundColor: '#39A900' }}>
                    {Math.round((todayData.vendidos / todayData.preparados) * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Desperdicio:</span>
                  <Badge className="bg-red-600">{todayData.desperdicio} almuerzos</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Promedio de aforo:</span>
                  <span>{todayData.aforoPromedio} personas</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Pico de ocupación:</span>
                  <span>{todayData.aforoMaximo} personas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE SEMANAL */}
        <TabsContent value="semana" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Preparados</CardDescription>
                <CardTitle className="text-3xl">{weekTotals.totalPreparados}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total vendidos</CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#00543A' }}>{weekTotals.totalVendidos}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Desperdicio</CardDescription>
                <CardTitle className="text-3xl text-red-700">{weekTotals.totalDesperdicio}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Ingresos totales</CardDescription>
                <CardTitle className="text-xl text-sara-green-dark">
                  ${weekTotals.totalIngresos.toLocaleString("es-CO")}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#39A900' }} />
                Tendencia Semanal
              </CardTitle>
              <CardDescription>Comparación día a día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="preparados" fill="#F27C00" name="Preparados" />
                  <Bar dataKey="vendidos" fill="#39A900" name="Vendidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Historial detallado de la semana */}
          <Card>
            <CardHeader>
              <CardTitle>Historial Detallado - Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weekData.map((record, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p>{new Date(record.fecha).toLocaleDateString("es-CO", { 
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        })}</p>
                      </div>
                      <Badge style={{ backgroundColor: '#39A900' }}>
                        ${record.ingresos.toLocaleString("es-CO")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Preparados</p>
                        <p>{record.preparados}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vendidos</p>
                        <p className="text-green-600">{record.vendidos}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Desperdicio</p>
                        <p className="text-red-600">{record.desperdicio}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Aforo Max</p>
                        <p>{record.aforoMaximo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE MENSUAL */}
        <TabsContent value="mes" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Mes - Preparados</CardDescription>
                <CardTitle className="text-3xl">{monthTotals.totalPreparados}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Mes - Vendidos</CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#00543A' }}>{monthTotals.totalVendidos}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Ingresos del Mes</CardDescription>
                <CardTitle className="text-xl text-sara-green-dark">
                  ${monthTotals.totalIngresos.toLocaleString("es-CO")}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: '#F27C00' }} />
                Tendencia Mensual (Por Semana)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="preparados" 
                    stroke="#F27C00" 
                    strokeWidth={2}
                    name="Preparados"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vendidos" 
                    stroke="#39A900" 
                    strokeWidth={2}
                    name="Vendidos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Historial mensual por semana */}
          <Card>
            <CardHeader>
              <CardTitle>Historial Detallado - Mes</CardTitle>
              <CardDescription>Resumen por semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthData.map((week, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p>{week.semana}</p>
                      <Badge style={{ backgroundColor: '#39A900' }}>
                        ${week.ingresos.toLocaleString("es-CO")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Preparados</p>
                        <p>{week.preparados}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vendidos</p>
                        <p className="text-green-600">{week.vendidos}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Eficiencia</p>
                        <p>{Math.round((week.vendidos / week.preparados) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis del Mes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Promedio diario de almuerzos:</span>
                <span>{Math.round(monthTotals.totalVendidos / 20)} por día</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa de aprovechamiento mensual:</span>
                <span className="text-green-600">
                  {Math.round((monthTotals.totalVendidos / monthTotals.totalPreparados) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ingreso promedio diario:</span>
                <span>${Math.round(monthTotals.totalIngresos / 20).toLocaleString("es-CO")}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acciones */}
      <div className="flex gap-4 flex-wrap">
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Generar Informe Completo
        </Button>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Comparar Períodos
        </Button>
      </div>
    </div>
  );
}
