import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  CreditCard,
  Clock,
  UtensilsCrossed,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Receipt,
  Infinity,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { priceStore } from "../../store/priceStore";

interface CreditRecord {
  id: string;
  date: string;
  menu: string;
  amount: number;
  status: "pendiente" | "pagado";
  paidAt?: string;
}

const MENU_OF_DAY = [
  { label: "Sopa", value: "Crema de ahuyama" },
  { label: "Proteína", value: "Pollo al horno" },
  { label: "Acompañante", value: "Arroz con lentejas" },
  { label: "Postre", value: "Fruta de temporada" },
];

const INITIAL_RECORDS: CreditRecord[] = [
  { id: "cr-001", date: "2024-04-15", menu: "Sancocho + Carne asada", amount: 5000, status: "pendiente" },
  { id: "cr-002", date: "2024-04-16", menu: "Ajiaco + Pollo", amount: 5000, status: "pendiente" },
  { id: "cr-003", date: "2024-04-14", menu: "Crema + Pescado", amount: 5000, status: "pagado", paidAt: "2024-04-17" },
];

export default function InstructorLunchCredit({ instructorName }: { instructorName: string }) {
  const LUNCH_PRICE = priceStore.getLunchPrice();
  const [records, setRecords] = useState<CreditRecord[]>(INITIAL_RECORDS);
  const [isWithinSchedule, setIsWithinSchedule] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reservedToday, setReservedToday] = useState(false);

  const totalDebt = records.filter((r) => r.status === "pendiente").reduce((sum, r) => sum + r.amount, 0);
  const pendingRecords = records.filter((r) => r.status === "pendiente");
  const paidRecords = records.filter((r) => r.status === "pagado");

  useEffect(() => {
    const check = () => {
      const now = new Date();
      setCurrentTime(now);
      const total = now.getHours() * 60 + now.getMinutes();
      setIsWithinSchedule(total >= 420 && total < 540);
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  const handleReserveOnCredit = () => {
    if (!isWithinSchedule) {
      toast.error("Fuera de horario", { description: "Solo puedes reservar entre 7:00 a. m. y 9:00 a. m." });
      return;
    }
    if (reservedToday) {
      toast.warning("Ya reservaste hoy", { description: "Solo puedes reservar un almuerzo por día" });
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const newRecord: CreditRecord = {
      id: `cr-${Date.now()}`,
      date: today,
      menu: MENU_OF_DAY.map((m) => m.value).join(" · "),
      amount: LUNCH_PRICE,
      status: "pendiente",
    };
    setRecords((prev) => [newRecord, ...prev]);
    setReservedToday(true);
    toast.success("¡Almuerzo reservado a crédito!", {
      description: `Se registró una deuda de $${LUNCH_PRICE.toLocaleString("es-CO")}. El administrador gestionará el pago.`,
    });
  };

  const scheduleColor = isWithinSchedule ? "#39A900" : "#9ca3af";

  return (
    <div className="space-y-6">
      {/* ── RESUMEN ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#39A900" }}>
                <Infinity className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-500">Cuenta institucional</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: "#39A900" }}>Sin límite</p>
            <p className="text-xs text-gray-400 mt-1">Sin cupo máximo de consumo</p>
          </CardContent>
        </Card>

        <Card className="border-0"
          style={{ background: totalDebt > 0 ? "linear-gradient(to bottom right,#fff4ec,white)" : "linear-gradient(to bottom right,#f0fce8,white)" }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: totalDebt > 0 ? "#F27C00" : "#39A900" }}>
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-500">Deuda pendiente</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: totalDebt > 0 ? "#F27C00" : "#39A900" }}>
              ${totalDebt.toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {pendingRecords.length} almuerzo{pendingRecords.length !== 1 ? "s" : ""} sin pagar
            </p>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sara-green">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-500">Almuerzos totales</p>
            </div>
            <p className="text-3xl font-extrabold text-sara-green-dark">{records.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {paidRecords.length} pagado{paidRecords.length !== 1 ? "s" : ""} · {pendingRecords.length} pendiente{pendingRecords.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de gestión de pago */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4 flex gap-3">
          <Info className="w-5 h-5 text-sara-green flex-shrink-0 mt-0.5" />
          <p className="text-sm text-sara-green-dark">
            El pago de las deudas es gestionado exclusivamente por el administrador del restaurante.
            Dirígete a administración para solventar tu saldo pendiente.
          </p>
        </CardContent>
      </Card>

      {/* ── RESERVAR A CRÉDITO ── */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#39A900" }}>
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base" style={{ color: "#39A900" }}>
                Registrar consumo de almuerzo
              </CardTitle>
              <p className="text-xs text-gray-400">Instructor: {instructorName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isWithinSchedule ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
            <Clock className="w-4 h-4" style={{ color: scheduleColor }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: scheduleColor }}>
                {isWithinSchedule ? "¡Horario activo! Puedes reservar ahora" : "Fuera de horario (7:00–9:00 a. m.)"}
              </p>
              <p className="text-xs text-gray-400">
                {currentTime.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {isWithinSchedule && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4" style={{ color: "#39A900" }} />
              <p className="text-sm font-semibold text-gray-700">Menú del día</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MENU_OF_DAY.map((item) => (
                <div key={item.label} className="text-xs">
                  <span className="text-gray-400">{item.label}: </span>
                  <span className="text-gray-700 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
              <span className="text-sm text-gray-500">Valor</span>
              <span className="font-extrabold" style={{ color: "#F27C00" }}>${LUNCH_PRICE.toLocaleString("es-CO")}</span>
            </div>
          </div>

          {reservedToday && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">Ya reservaste tu almuerzo hoy.</p>
            </div>
          )}

          <button
            onClick={handleReserveOnCredit}
            disabled={!isWithinSchedule || reservedToday}
            className="w-full h-12 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: isWithinSchedule && !reservedToday ? "#39A900" : "#9ca3af" }}
          >
            <CreditCard className="w-5 h-5" />
            Reservar y registrar en mi deuda
          </button>
          <p className="text-xs text-center text-gray-400">
            La deuda quedará registrada. El administrador gestionará el pago.
          </p>
        </CardContent>
      </Card>

      {/* ── DEUDAS PENDIENTES (solo visualización) ── */}
      {pendingRecords.length > 0 && (
        <Card className="border-0" style={{ borderLeftColor: "#F27C00" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" style={{ color: "#F27C00" }} />
              <CardTitle className="text-base" style={{ color: "#F27C00" }}>
                Deudas Pendientes
              </CardTitle>
              <Badge className="ml-auto text-xs" style={{ backgroundColor: "#F27C00", color: "white" }}>
                ${totalDebt.toLocaleString("es-CO")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" style={{ color: "#F27C00" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{record.date}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{record.menu}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: "#F27C00" }}>
                  ${record.amount.toLocaleString("es-CO")}
                </span>
              </div>
            ))}
            <p className="text-xs text-center text-gray-400 pt-1">
              Para cancelar estas deudas comunícate con el administrador del restaurante
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── HISTORIAL PAGADO ── */}
      {paidRecords.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: "#39A900" }} />
              <CardTitle className="text-base text-gray-700">Historial Pagado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {paidRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{record.date}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{record.menu}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">${record.amount.toLocaleString("es-CO")}</p>
                  <Badge className="text-xs bg-green-100 text-green-700 border-0">Pagado {record.paidAt}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {records.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8 text-center text-sara-green-dark">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aún no tienes consumos registrados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
