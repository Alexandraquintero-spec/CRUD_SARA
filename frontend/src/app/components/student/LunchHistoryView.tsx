import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  UtensilsCrossed,
  CheckCircle,
  ScanFace,
  CalendarDays,
  TrendingUp,
  Clock,
} from "lucide-react";

export interface LunchRecord {
  id: string;
  date: string;
  menu: string;
  amount: number;
  status: "confirmado" | "pendiente" | "cancelado";
  time: string;
}

interface LunchHistoryViewProps {
  userIdentifier: string; // ficha para aprendiz, nombre para instructor
  records: LunchRecord[];
}

const statusConfig = {
  confirmado: {
    label: "Confirmado",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
  },
  pendiente: {
    label: "Pendiente",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: <Clock className="w-4 h-4 text-yellow-600" />,
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    icon: <span className="text-red-400 text-xs">✕</span>,
  },
};

export default function LunchHistoryView({
  userIdentifier,
  records,
}: LunchHistoryViewProps) {
  const [filterStatus, setFilterStatus] = useState<
    "todos" | "confirmado" | "pendiente" | "cancelado"
  >("todos");

  const filtered =
    filterStatus === "todos"
      ? records
      : records.filter((r) => r.status === filterStatus);

  const totalSpent = records
    .filter((r) => r.status === "confirmado")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalConfirmed = records.filter((r) => r.status === "confirmado").length;
  const totalPending = records.filter((r) => r.status === "pendiente").length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#39A900" }}
              >
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500">Almuerzos confirmados</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#39A900" }}>
              {totalConfirmed}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-400">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <p className="text-3xl font-extrabold text-yellow-600">
              {totalPending}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#F27C00" }}
              >
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500">Total pagado</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#F27C00" }}>
              ${totalSpent.toLocaleString("es-CO")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["todos", "confirmado", "pendiente", "cancelado"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all capitalize"
              style={{
                backgroundColor: filterStatus === f ? "#39A900" : "white",
                borderColor: filterStatus === f ? "#39A900" : "#e5e7eb",
                color: filterStatus === f ? "white" : "#6b7280",
              }}
            >
              {f === "todos" ? "Todos" : statusConfig[f].label}
              <span className="ml-1.5 text-xs opacity-70">
                ({f === "todos" ? records.length : records.filter((r) => r.status === f).length})
              </span>
            </button>
          )
        )}
      </div>

      {/* Listado */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center text-gray-400">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin registros</p>
            <p className="text-sm mt-1">
              Aún no tienes almuerzos en esta categoría
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const cfg = statusConfig[record.status];
            return (
              <Card
                key={record.id}
                className="bg-white hover: transition-shadow"
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Icono + info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#39A900" }}
                      >
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-800">
                              {new Date(record.date).toLocaleDateString("es-CO", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">· {record.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{record.menu}</p>
                      </div>
                    </div>

                    {/* Monto + estado + modo de ingreso */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold" style={{ color: "#F27C00" }}>
                          ${record.amount.toLocaleString("es-CO")}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          {cfg.icon}
                          <span className={`text-xs font-medium ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      {record.status === "confirmado" && (
                        <div className="hidden sm:flex flex-col items-center gap-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#39A90015" }}
                          >
                            <ScanFace className="w-5 h-5" style={{ color: "#39A900" }} />
                          </div>
                          <span className="text-xs text-gray-400">Ingreso facial</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {records.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 flex gap-3 items-start">
            <span className="text-sara-green text-lg"></span>
            <p className="text-sm text-sara-green-dark">
              Tu historial de almuerzos aparecerá aquí una vez que realices tu
              primera reserva. Recuerda que las reservas están disponibles de
              7:00 a. m. a 9:00 a. m..
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
