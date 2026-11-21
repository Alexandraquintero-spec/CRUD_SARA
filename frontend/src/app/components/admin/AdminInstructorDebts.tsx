import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Receipt,
  AlertCircle,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";

interface InstructorDebt {
  id: string;
  name: string;
  program: string;
  totalDebt: number;
  totalAlmuerzos: number;
  paidAlmuerzos: number;
  pendingAlmuerzos: number;
  debts: {
    id: string;
    date: string;
    menu: string;
    amount: number;
    status: "pendiente" | "pagado";
  }[];
}

const INITIAL_DEBTS: InstructorDebt[] = [
  {
    id: "inst-01",
    name: "Carlos Andrés Martínez",
    program: "Gastronomía y Cocina",
    totalDebt: 15000,
    totalAlmuerzos: 5,
    paidAlmuerzos: 2,
    pendingAlmuerzos: 3,
    debts: [
      { id: "d1", date: "2024-04-15", menu: "Sancocho + Carne asada", amount: 5000, status: "pendiente" },
      { id: "d2", date: "2024-04-16", menu: "Ajiaco + Pollo al horno", amount: 5000, status: "pendiente" },
      { id: "d3", date: "2024-04-17", menu: "Crema + Trucha", amount: 5000, status: "pendiente" },
      { id: "d4", date: "2024-04-14", menu: "Sopa + Cerdo", amount: 5000, status: "pagado" },
      { id: "d5", date: "2024-04-13", menu: "Crema + Pollo", amount: 5000, status: "pagado" },
    ],
  },
  {
    id: "inst-02",
    name: "Laura Sofía Jiménez",
    program: "Panadería y Repostería",
    totalDebt: 10000,
    totalAlmuerzos: 4,
    paidAlmuerzos: 2,
    pendingAlmuerzos: 2,
    debts: [
      { id: "d6", date: "2024-04-17", menu: "Consomé + Res", amount: 5000, status: "pendiente" },
      { id: "d7", date: "2024-04-16", menu: "Ajiaco + Cerdo", amount: 5000, status: "pendiente" },
      { id: "d8", date: "2024-04-15", menu: "Crema + Pollo", amount: 5000, status: "pagado" },
      { id: "d9", date: "2024-04-14", menu: "Sopa + Pescado", amount: 5000, status: "pagado" },
    ],
  },
  {
    id: "inst-03",
    name: "Jorge Iván Sánchez",
    program: "Administración de Empresas Gastronómicas",
    totalDebt: 0,
    totalAlmuerzos: 3,
    paidAlmuerzos: 3,
    pendingAlmuerzos: 0,
    debts: [
      { id: "d10", date: "2024-04-17", menu: "Crema + Pollo", amount: 5000, status: "pagado" },
      { id: "d11", date: "2024-04-16", menu: "Ajiaco + Res", amount: 5000, status: "pagado" },
      { id: "d12", date: "2024-04-15", menu: "Sopa + Cerdo", amount: 5000, status: "pagado" },
    ],
  },
  {
    id: "inst-04",
    name: "Paola Andrea Torres",
    program: "Gastronomía y Cocina",
    totalDebt: 25000,
    totalAlmuerzos: 6,
    paidAlmuerzos: 1,
    pendingAlmuerzos: 5,
    debts: [
      { id: "d13", date: "2024-04-18", menu: "Crema + Trucha", amount: 5000, status: "pendiente" },
      { id: "d14", date: "2024-04-17", menu: "Sopa + Pollo", amount: 5000, status: "pendiente" },
      { id: "d15", date: "2024-04-16", menu: "Ajiaco + Res", amount: 5000, status: "pendiente" },
      { id: "d16", date: "2024-04-15", menu: "Consomé + Cerdo", amount: 5000, status: "pendiente" },
      { id: "d17", date: "2024-04-14", menu: "Crema + Pollo", amount: 5000, status: "pendiente" },
      { id: "d18", date: "2024-04-13", menu: "Sopa + Trucha", amount: 5000, status: "pagado" },
    ],
  },
];

export default function AdminInstructorDebts() {
  const [instructors, setInstructors] = useState<InstructorDebt[]>(INITIAL_DEBTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const totalGlobalDebt = instructors.reduce((sum, i) => sum + i.totalDebt, 0);
  const instructorsWithDebt = instructors.filter((i) => i.totalDebt > 0).length;
  const instructorsDebtFree = instructors.filter((i) => i.totalDebt === 0).length;

  const handlePayAll = (instructorId: string) => {
    setInstructors((prev) =>
      prev.map((inst) =>
        inst.id === instructorId
          ? {
              ...inst,
              totalDebt: 0,
              paidAlmuerzos: inst.totalAlmuerzos,
              pendingAlmuerzos: 0,
              debts: inst.debts.map((d) => ({ ...d, status: "pagado" as const })),
            }
          : inst
      )
    );
    const inst = instructors.find((i) => i.id === instructorId);
    toast.success(`Deuda de ${inst?.name} saldada`, {
      description: `$${inst?.totalDebt.toLocaleString("es-CO")} marcados como pagados`,
    });
  };

  const handlePayOne = (instructorId: string, debtId: string) => {
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id !== instructorId) return inst;
        const updatedDebts = inst.debts.map((d) =>
          d.id === debtId ? { ...d, status: "pagado" as const } : d
        );
        const newDebt = updatedDebts
          .filter((d) => d.status === "pendiente")
          .reduce((sum, d) => sum + d.amount, 0);
        return {
          ...inst,
          debts: updatedDebts,
          totalDebt: newDebt,
          paidAlmuerzos: updatedDebts.filter((d) => d.status === "pagado").length,
          pendingAlmuerzos: updatedDebts.filter((d) => d.status === "pendiente").length,
        };
      })
    );
    toast.success("Almuerzo marcado como pagado");
  };

  const filtered = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Resumen global */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4" style={{ color: "#F27C00" }} />
              <p className="text-xs text-gray-500">Deuda total</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: "#F27C00" }}>
              ${totalGlobalDebt.toLocaleString("es-CO")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-gray-500">Con deuda</p>
            </div>
            <p className="text-2xl font-extrabold text-red-600">{instructorsWithDebt}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Al día</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: "#39A900" }}>{instructorsDebtFree}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-sara-green" />
              <p className="text-xs text-gray-500">Instructores</p>
            </div>
            <p className="text-2xl font-extrabold text-sara-green-dark">{instructors.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar instructor por nombre o programa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      {/* Lista de instructores */}
      <div className="space-y-3">
        {filtered.map((inst) => {
          const isExpanded = expanded === inst.id;
          const hasDebt = inst.totalDebt > 0;
          return (
            <Card
              key={inst.id}
              className={`border-0 shadow-sm transition-shadow hover:shadow-md ${
                hasDebt ? "" : ""
              }`}
              style={hasDebt ? { borderLeftColor: "#F27C00" } : {}}
            >
              <CardContent className="pt-4 pb-4">
                {/* Row principal */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: hasDebt ? "#F27C00" : "#39A900" }}
                  >
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{inst.name}</p>
                    <p className="text-xs text-gray-500 truncate">{inst.program}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        <TrendingUp className="w-3 h-3 inline mr-0.5" />
                        {inst.totalAlmuerzos} almuerzos · {inst.paidAlmuerzos} pagados · {inst.pendingAlmuerzos} pendientes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className="text-lg font-extrabold"
                        style={{ color: hasDebt ? "#F27C00" : "#39A900" }}
                      >
                        {hasDebt ? `$${inst.totalDebt.toLocaleString("es-CO")}` : "Al día"}
                      </p>
                      {hasDebt && (
                        <p className="text-xs text-gray-400">{inst.pendingAlmuerzos} sin pagar</p>
                      )}
                    </div>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : inst.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                    {hasDebt && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="text-white text-xs rounded-lg"
                          style={{ backgroundColor: "#F27C00" }}
                          onClick={() => handlePayAll(inst.id)}
                        >
                          <Banknote className="w-3.5 h-3.5 mr-1" />
                          Marcar todo pagado (${inst.totalDebt.toLocaleString("es-CO")})
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {inst.debts.map((d) => (
                        <div
                          key={d.id}
                          className={`flex items-center justify-between rounded-xl p-3 text-sm ${
                            d.status === "pendiente"
                              ? "bg-orange-50 border border-orange-200"
                              : "bg-green-50 border border-green-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {d.status === "pendiente" ? (
                              <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-xs font-medium text-gray-700">{d.date}</p>
                              <p className="text-xs text-gray-500">{d.menu}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-bold"
                              style={{ color: d.status === "pendiente" ? "#F27C00" : "#39A900" }}
                            >
                              ${d.amount.toLocaleString("es-CO")}
                            </span>
                            {d.status === "pendiente" && (
                              <Button
                                size="sm"
                                className="text-white text-xs h-7 px-2 rounded-lg"
                                style={{ backgroundColor: "#39A900" }}
                                onClick={() => handlePayOne(inst.id, d.id)}
                              >
                                Marcar pagado
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-10 text-center text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron instructores</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
