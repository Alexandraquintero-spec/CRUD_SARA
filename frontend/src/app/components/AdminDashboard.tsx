import { useState, useMemo } from "react";
import { User } from "../types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useGlobalData } from "../GlobalDataContext";
import {
  LogOut,
  TrendingUp,
  UtensilsCrossed,
  DollarSign,
  Users,
  Calendar,
  Package,
  CalendarDays,
  FileText,
  Settings2,
  ChartPie,
  MessageSquare,
  Receipt,
  GraduationCap,
  UserCog,
  CreditCard,
  Warehouse,
  ScanFace,
} from "lucide-react";
import { Progress } from "./ui/progress";
import Brand from "./Brand";
import bgPattern from "../../imports/background-pattern.svg";

// Herramientas de gestión
import MenuManagement from "./instructor/MenuManagement";
import TicketControl from "./instructor/TicketControl";
import AforoControl from "./instructor/AforoControl";
import LunchControl from "./instructor/LunchControl";

import AdminSuggestionsView from "./admin/AdminSuggestionsView";
import AdminInventoryView from "./admin/AdminInventoryView";
import AdminInstructorDebts from "./admin/AdminInstructorDebts";
import AdminGroupsView from "./admin/AdminGroupsView";
import AdminPriceManagement from "./admin/AdminPriceManagement";
import RoleManagement from "./admin/RoleManagement";
import TransactionsView from "./admin/TransactionsView";
import AdminVisitorPurchase from "./admin/AdminVisitorPurchase";
import AdminBeneficiaries from "./admin/AdminBeneficiaries";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type TabGroup = "reportes" | "gestion";

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const { transactions, registeredUsers, visitors } = useGlobalData();
  const [activeTab, setActiveTab] = useState("general");
  const [tabGroup, setTabGroup] = useState<TabGroup>("reportes");
  const uniqueVisitors = visitors.length;

  // Calcular datos desde las transacciones reales
  const { lunchData, totalIngresosGenerales } = useMemo(() => {
    const lunchTransactions = transactions.filter((t) => t.type === "almuerzo");
    const ingresosAlmuerzos = lunchTransactions.reduce((sum, t) => sum + t.amount, 0);

    const almuerzosPorDia = lunchTransactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const dayOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][date.getDay()];
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = { dia: dayOfWeek, cantidad: 0, ingresos: 0 };
      }
      acc[dayOfWeek].cantidad++;
      acc[dayOfWeek].ingresos += t.amount;
      return acc;
    }, {} as Record<string, { dia: string; cantidad: number; ingresos: number }>);

    return {
      lunchData: {
        totalAlmuerzos: lunchTransactions.length,
        ingresosTotales: ingresosAlmuerzos,
        promedioSemanal: Math.round(lunchTransactions.length / 4),
        almuerzosPorDia: Object.values(almuerzosPorDia).filter((d) => d.dia !== "Domingo" && d.dia !== "Sábado"),
        almuerzosPorSemana: [],
      },
      totalIngresosGenerales: ingresosAlmuerzos,
    };
  }, [transactions]);

  const switchGroup = (group: TabGroup, firstTab: string) => {
    setTabGroup(group);
    setActiveTab(firstTab);
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#F6F8F3" }}>
      {/* Fondo decorativo */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          opacity: 0.04,
        }}
      />
      {/* ── HEADER ── */}
      <header className="relative overflow-hidden text-white" style={{ background: "linear-gradient(120deg, #123D05 0%, #1A5208 45%, #2E8A00 100%)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute right-40 -bottom-20 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brand size="sm" tone="dark" subtitle="Administrador" />
            </div>
            <div className="flex items-center gap-3">
              <Badge className="text-xs hidden sm:flex bg-white/15 text-white border border-white/25">
                {user.name}
              </Badge>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="text-xs bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>

          <div className="pt-5 pb-7">
            <h1 className="text-3xl font-extrabold tracking-tight">Panel del administrador</h1>
            <p className="text-sm text-white/80 mt-1">Reportes y gestión del servicio de gastronomía</p>
          </div>
        </div>
      </header>

      {/* ── SELECTOR DE GRUPO ── */}
      <div className="bg-white border-b border-sara-line relative">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="inline-flex gap-1 rounded-2xl bg-surface-secondary p-1">
          <button
            onClick={() => switchGroup("reportes", "general")}
            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-colors ${tabGroup === "reportes" ? "bg-white text-sara-ink shadow-sm" : "text-gray-500 hover:text-sara-ink"}`}
          >
            <ChartPie className="w-4 h-4" />
            Reportes y estadísticas
          </button>
          <button
            onClick={() => switchGroup("gestion", "inventario")}
            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-colors ${tabGroup === "gestion" ? "bg-white text-sara-ink shadow-sm" : "text-gray-500 hover:text-sara-ink"}`}
          >
            <Settings2 className="w-4 h-4" />
            Gestión
          </button>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* ── REPORTES ── */}
          {tabGroup === "reportes" && (
            <>
              <TabsList className="inline-flex">
                <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
                  <TrendingUp className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="almuerzos" className="gap-2 text-xs sm:text-sm">
                  <UtensilsCrossed className="w-4 h-4" />
                  Almuerzos
                </TabsTrigger>
                <TabsTrigger value="grupos" className="gap-2 text-xs sm:text-sm">
                  <GraduationCap className="w-4 h-4" />
                  Grupos
                </TabsTrigger>
                <TabsTrigger value="deudas-instructores" className="gap-2 text-xs sm:text-sm">
                  <Receipt className="w-4 h-4" />
                  <span className="hidden sm:inline">Deudas instructores</span>
                  <span className="sm:hidden">Deudas</span>
                </TabsTrigger>
                <TabsTrigger value="observaciones" className="gap-2 text-xs sm:text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Observaciones
                </TabsTrigger>
                <TabsTrigger value="transacciones" className="gap-2 text-xs sm:text-sm">
                  <CreditCard className="w-4 h-4" />
                  Transacciones
                </TabsTrigger>
              </TabsList>

              {/* Vista General */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: "#F27C00" }}>
                      <DollarSign className="w-6 h-6" />
                      Ingresos totales del sistema
                    </CardTitle>
                    <CardDescription>Resumen consolidado de todas las operaciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-7xl mb-4" style={{ color: "#F27C00" }}>
                        ${totalIngresosGenerales.toLocaleString("es-CO")}
                      </p>
                      <p className="text-lg text-gray-600">Ingresos totales por almuerzos</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <UtensilsCrossed className="w-5 h-5" />
                      Almuerzos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Total vendido</span>
                        <span className="font-bold">{lunchData.totalAlmuerzos}</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div className="text-center pt-4">
                      <p className="text-3xl text-green-700">${lunchData.ingresosTotales.toLocaleString("es-CO")}</p>
                      <p className="text-sm text-gray-600">Ingresos totales</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">Promedio semanal</p>
                      <p className="text-xl text-green-700">{lunchData.promedioSemanal} almuerzos</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { label: "Total almuerzos", value: lunchData.totalAlmuerzos.toString() },
                    { label: "Ticket promedio", value: lunchData.totalAlmuerzos > 0 ? `$${Math.round(totalIngresosGenerales / lunchData.totalAlmuerzos).toLocaleString("es-CO")}` : "$0" },
                    { label: "Usuarios activos", value: registeredUsers.length.toString() },
                    { label: "Visitantes registrados", value: uniqueVisitors.toString() },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <CardHeader className="pb-3">
                        <CardDescription>{stat.label}</CardDescription>
                        <CardTitle className="text-2xl">{stat.value}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Vista Almuerzos */}
              <TabsContent value="almuerzos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <UtensilsCrossed className="w-6 h-6" />
                      Reporte de Almuerzos
                    </CardTitle>
                    <CardDescription>Análisis de ventas de almuerzos del restaurante</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Total almuerzos</CardDescription>
                          <CardTitle className="text-3xl text-green-700">{lunchData.totalAlmuerzos}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Ingresos totales</CardDescription>
                          <CardTitle className="text-3xl text-sara-green-dark">${lunchData.ingresosTotales.toLocaleString("es-CO")}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Promedio semanal</CardDescription>
                          <CardTitle className="text-3xl text-orange-700">{lunchData.promedioSemanal}</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader><CardTitle>Ventas por Día de la Semana</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {lunchData.almuerzosPorDia.map((dia, i) => (
                            <div key={i}>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">{dia.dia}</span>
                                <span className="text-sm text-gray-600">{dia.cantidad} almuerzos · ${dia.ingresos.toLocaleString("es-CO")}</span>
                              </div>
                              <Progress value={(dia.cantidad / lunchData.totalAlmuerzos) * 100} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    {lunchData.almuerzosPorSemana.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Evolución Semanal
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {lunchData.almuerzosPorSemana.map((sem, i) => (
                              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <p className="font-medium">{sem.semana}</p>
                                  <p className="text-sm text-gray-600">{sem.cantidad} almuerzos vendidos</p>
                                </div>
                                <p className="text-xl text-green-700">${sem.ingresos.toLocaleString("es-CO")}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vista Grupos */}
              <TabsContent value="grupos">
                <AdminGroupsView />
              </TabsContent>

              {/* Vista Deudas instructores */}
              <TabsContent value="deudas-instructores">
                <AdminInstructorDebts />
              </TabsContent>

              {/* Vista Observaciones */}
              <TabsContent value="observaciones">
                <AdminSuggestionsView />
              </TabsContent>

              {/* Vista Transacciones */}
              <TabsContent value="transacciones">
                <TransactionsView />
              </TabsContent>
            </>
          )}

          {/* ── GESTIÓN DEL RESTAURANTE ── */}
          {tabGroup === "gestion" && (
            <>
              <div className="overflow-x-auto">
                <TabsList className="inline-flex">
                  <TabsTrigger value="inventario" className="gap-2 text-xs sm:text-sm">
                    <Warehouse className="w-4 h-4" />
                    Inventario
                  </TabsTrigger>
                  <TabsTrigger value="menu-gestion" className="gap-2 text-xs sm:text-sm">
                    <CalendarDays className="w-4 h-4" />
                    Menú
                  </TabsTrigger>
                  <TabsTrigger value="almuerzos-gestion" className="gap-2 text-xs sm:text-sm">
                    <UtensilsCrossed className="w-4 h-4" />
                    Almuerzos
                  </TabsTrigger>
                  <TabsTrigger value="ingresos" className="gap-2 text-xs sm:text-sm">
                    <ScanFace className="w-4 h-4" />
                    Ingresos
                  </TabsTrigger>
                  <TabsTrigger value="aforo" className="gap-2 text-xs sm:text-sm">
                    <Users className="w-4 h-4" />
                    Aforo
                  </TabsTrigger>
                  <TabsTrigger value="precios" className="gap-2 text-xs sm:text-sm">
                    <DollarSign className="w-4 h-4" />
                    Precios
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="gap-2 text-xs sm:text-sm">
                    <UserCog className="w-4 h-4" />
                    Cuentas
                  </TabsTrigger>
                  <TabsTrigger value="beneficiarios" className="gap-2 text-xs sm:text-sm">
                    <GraduationCap className="w-4 h-4" />
                    Aprendices
                  </TabsTrigger>
                  <TabsTrigger value="visitantes" className="gap-2 text-xs sm:text-sm">
                    <Users className="w-4 h-4" />
                    Visitantes
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="inventario">
                <AdminInventoryView />
              </TabsContent>
              <TabsContent value="menu-gestion">
                <MenuManagement />
              </TabsContent>
              <TabsContent value="almuerzos-gestion">
                <LunchControl />
              </TabsContent>
              <TabsContent value="ingresos">
                <TicketControl />
              </TabsContent>
              <TabsContent value="aforo">
                <AforoControl />
              </TabsContent>
              <TabsContent value="precios">
                <AdminPriceManagement />
              </TabsContent>
              <TabsContent value="roles">
                <RoleManagement />
              </TabsContent>
              <TabsContent value="beneficiarios">
                <AdminBeneficiaries />
              </TabsContent>
              <TabsContent value="visitantes">
                <AdminVisitorPurchase />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
