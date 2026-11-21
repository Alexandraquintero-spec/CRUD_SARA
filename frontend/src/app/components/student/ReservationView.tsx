import { useState, useEffect } from "react";
import { Alert, Button, Card, Chip } from "@heroui/react";
import {
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  ArrowLeft,
  CalendarDays,
  ScanFace,
  XCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { LunchRecord } from "./LunchHistoryView";
import { useGlobalData } from "../../GlobalDataContext";
import { User } from "../../types";
import { priceStore } from "../../store/priceStore";

interface ReservationViewProps {
  userIdentifier: string;
  onNewRecord: (record: LunchRecord) => void;
  user?: User;
}

/*
 * Reserva del almuerzo: el aprendiz reserva entre 7:00 y 9:00 a. m. y paga con el QR
 * de Nequi que muestra el sistema. No hay boleta: al mediodía ingresa con reconocimiento facial.
 */
type ViewState = "info" | "confirm" | "confirmed";

const MENU_OF_DAY = [
  { label: "Sopa", value: "Crema de ahuyama" },
  { label: "Proteína", value: "Pollo al horno" },
  { label: "Acompañante", value: "Arroz con lentejas" },
  { label: "Postre", value: "Fruta de temporada" },
];

const G500 = "#39A900";
const G600 = "#2E8A00";
const O500 = "#F27C00";

/* QR de pago (representación visual del código que se escanea con Nequi) */
function PaymentQR({ value }: { value: string }) {
  const size = 25;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    const finder = (rr: number, cc: number) => {
      const inBox = rr >= 0 && rr < 7 && cc >= 0 && cc < 7;
      if (!inBox) return null;
      if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
      return rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    };
    const f = finder(r, c) ?? finder(r, c - (size - 7)) ?? finder(r - (size - 7), c);
    if (f !== null) return f;
    if ((r < 8 && (c < 8 || c >= size - 8)) || (r >= size - 8 && c < 8)) return false;
    let h = 2166136261 ^ value.length;
    for (const v of [r, c, value.charCodeAt((r * 7 + c) % value.length)]) {
      h = Math.imul(h ^ v, 16777619);
      h ^= h >>> 13;
    }
    return ((h >>> 0) % 100) < 46;
  });
  return (
    <div className="inline-block rounded-3xl bg-white p-4 shadow-xl ring-1 ring-black/5">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${size}, 8px)` }}>
        {cells.map((on, i) => (
          <span key={i} className="block w-2 h-2 rounded-[1.5px]" style={{ backgroundColor: on ? "#1B0A24" : "transparent" }} />
        ))}
      </div>
    </div>
  );
}

export default function ReservationView({ userIdentifier, onNewRecord, user }: ReservationViewProps) {
  const { addTransaction } = useGlobalData();
  const LUNCH_PRICE = user?.beneficiary ? 0 : priceStore.getLunchPrice();
  const [view, setView] = useState<ViewState>("info");
  const [isWithinSchedule, setIsWithinSchedule] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [confirmedRecord, setConfirmedRecord] = useState<LunchRecord | null>(null);
  const [reservedToday, setReservedToday] = useState(false);
  // Permite ver el flujo completo fuera del horario (solo para revisar el prototipo)
  const [demoMode, setDemoMode] = useState(false);
  const canReserve = isWithinSchedule || demoMode;

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

  const price = `$${LUNCH_PRICE.toLocaleString("es-CO")}`;
  const payRef = `SARA-${userIdentifier}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;

  const handleStart = () => {
    if (!canReserve) {
      toast.error("Fuera de horario", { description: "Solo puedes reservar entre 7:00 a. m. y 9:00 a. m." });
      return;
    }
    if (reservedToday) {
      toast.warning("Ya reservaste hoy", { description: "Solo puedes reservar un almuerzo por día" });
      return;
    }
    setView("confirm");
  };

  const handleConfirm = () => {
    const now = new Date();
    const record: LunchRecord = {
      id: `lunch-${Date.now()}`,
      date: now.toISOString().split("T")[0],
      menu: MENU_OF_DAY.map((m) => m.value).join(" · "),
      amount: LUNCH_PRICE,
      status: "confirmado",
      time: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
    onNewRecord(record);
    setConfirmedRecord(record);
    setReservedToday(true);
    setView("confirmed");

    if (user) {
      addTransaction({
        type: "almuerzo",
        userId: user.id,
        userName: user.name,
        userRole: user.role || "aprendiz",
        amount: LUNCH_PRICE,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        details: MENU_OF_DAY.map((m) => m.value).join(" · "),
        status: "completado",
      });
    }

    toast.success("Reserva confirmada", { description: "Al mediodía ingresa al comedor con reconocimiento facial." });
  };

  const scheduleMsg = isWithinSchedule
    ? "Horario de reservas activo"
    : currentTime.getHours() < 7
    ? "Las reservas abren a las 7:00 a. m."
    : "Las reservas cerraron a las 9:00 a. m.";
  const scheduleStatus = isWithinSchedule ? "success" : currentTime.getHours() < 7 ? "warning" : "danger";

  /* Pasos del ingreso al comedor (se muestran tras confirmar) */
  const EntrySteps = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${G600}, ${G500})` }}>
        <CheckCircle2 className="w-6 h-6" />
        <p className="mt-2 font-bold">Pantalla en verde</p>
        <p className="text-xs text-white/85">Tienes reserva: puedes seguir al comedor.</p>
      </div>
      <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #C8102E, #E5484D)" }}>
        <XCircle className="w-6 h-6" />
        <p className="mt-2 font-bold">Pantalla en rojo</p>
        <p className="text-xs text-white/85">La pantalla te indica por qué no puedes ingresar.</p>
      </div>
    </div>
  );

  // ── CONFIRMADA ──
  if (view === "confirmed" && confirmedRecord) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card className="overflow-hidden p-0 gap-0 rounded-3xl border-0 shadow-lg">
          <div className="px-6 py-7 text-center text-white" style={{ background: `linear-gradient(135deg, ${G600}, ${G500})` }}>
            <span className="mx-auto w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </span>
            <h3 className="mt-3 text-2xl font-extrabold">Reserva confirmada</h3>
            <p className="text-sm text-white/85">Tu almuerzo está asegurado para hoy</p>
          </div>
          <div className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-surface-secondary p-3">
                <p className="text-xs text-gray-500">Aprendiz</p>
                <p className="font-semibold">{userIdentifier}</p>
              </div>
              <div className="rounded-2xl bg-surface-secondary p-3">
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="font-semibold">{new Date(confirmedRecord.date + "T12:00:00").toLocaleDateString("es-CO")}</p>
              </div>
              <div className="rounded-2xl bg-surface-secondary p-3">
                <p className="text-xs text-gray-500">Valor</p>
                <p className="font-semibold" style={{ color: O500 }}>{price}</p>
              </div>
              <div className="rounded-2xl bg-surface-secondary p-3">
                <p className="text-xs text-gray-500">Almuerzo</p>
                <p className="font-semibold">12:00 m. – 1:30 p. m.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl p-4" style={{ backgroundColor: "#F1FAEB" }}>
              <span className="w-10 h-10 flex-none rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: G500 }}>
                <ScanFace className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold" style={{ color: G600 }}>Ingresa con tu rostro</p>
                <p className="text-sm text-gray-600">
                  No tienes que mostrar nada. Al mediodía párate frente a la cámara del comedor.
                </p>
              </div>
            </div>

            <EntrySteps />

            <Button variant="outline" fullWidth onPress={() => setView("info")}>
              <ArrowLeft className="w-4 h-4" />
              Volver a reservas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── PAGAR CON NEQUI Y CONFIRMAR ──
  if (view === "confirm") {
    const isFree = LUNCH_PRICE === 0;
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Button variant="ghost" size="sm" onPress={() => setView("info")}>
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <Card className="overflow-hidden p-0 gap-0 rounded-3xl border-0 shadow-xl">
          <div className="relative px-6 py-6 text-white" style={{ background: "linear-gradient(135deg, #2D0A3E 0%, #5B1A7A 55%, #C2187A 100%)" }}>
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white/75">{isFree ? "Almuerzo de beneficiario" : "Paga tu almuerzo"}</p>
                <h3 className="text-2xl font-extrabold">{isFree ? "Sin costo" : "Pago con Nequi"}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/75">Total</p>
                <p className="text-3xl font-extrabold">{price}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 bg-white">
            <div className="rounded-2xl bg-surface-secondary p-4">
              <p className="text-sm font-semibold">Almuerzo del día</p>
              <p className="text-xs text-gray-500">{MENU_OF_DAY.map((m) => m.value).join(" · ")}</p>
            </div>

            {!isFree && (
              <>
                <div className="flex flex-col items-center gap-3">
                  <PaymentQR value={payRef} />
                  <p className="text-xs text-gray-500">
                    Referencia: <span className="font-mono font-semibold text-sara-ink">{payRef}</span>
                  </p>
                </div>
                <ol className="space-y-2.5">
                  {[
                    "Abre la app Nequi en tu celular.",
                    "Elige «Pagar con QR» y escanea este código.",
                    `Confirma el pago de ${price} en Nequi.`,
                    "Regresa aquí y presiona «Ya pagué».",
                  ].map((t, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="w-6 h-6 flex-none rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: "#5B1A7A" }}>
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
                <Alert status="accent">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Ya no tienes que salir del ambiente</Alert.Title>
                    <Alert.Description>El QR de pago aparece aquí mismo; no necesitas buscar el código impreso.</Alert.Description>
                  </Alert.Content>
                </Alert>
              </>
            )}

            <Alert status="success">
              <Alert.Indicator>
                <ScanFace className="w-4 h-4" />
              </Alert.Indicator>
              <Alert.Content>
                <Alert.Title>Ingreso con reconocimiento facial</Alert.Title>
                <Alert.Description>Al mediodía solo te paras frente a la cámara del comedor; no tienes que mostrar nada.</Alert.Description>
              </Alert.Content>
            </Alert>

            <Button size="lg" fullWidth onPress={handleConfirm}>
              <CheckCircle2 className="w-5 h-5" />
              {isFree ? "Confirmar reserva" : `Ya pagué · confirmar reserva`}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── INFORMACIÓN (inicio) ──
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Alert status={scheduleStatus}>
        <Alert.Indicator>
          <Clock className="w-4 h-4" />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>{scheduleMsg}</Alert.Title>
          <Alert.Description>
            Hora actual: {currentTime.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Card className="rounded-3xl border border-sara-line">
        <Card.Header className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: G500 }} />
            <Card.Title className="text-base font-bold">Menú de hoy</Card.Title>
          </div>
          <Chip color="accent" variant="soft" size="sm">
            <Chip.Label>{price}</Chip.Label>
          </Chip>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 gap-2">
            {MENU_OF_DAY.map((item) => (
              <div key={item.label} className="rounded-2xl bg-surface-secondary p-3">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card className="rounded-3xl border border-sara-line">
        <Card.Header>
          <Card.Title className="text-base font-bold">Así funciona</Card.Title>
        </Card.Header>
        <Card.Content>
          <ol className="space-y-3">
            {[
              "Reserva entre las 7:00 y las 9:00 a. m. y paga con el QR de Nequi que aparece en pantalla.",
              "De 12:00 m. a 1:30 p. m. párate frente a la cámara del comedor.",
              "Si tienes reserva, la pantalla se pone en verde y sigues; si no, en rojo y te indica el motivo.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 flex-none rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: G500 }}>
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-start gap-2 rounded-2xl p-3 text-sm" style={{ backgroundColor: "#FFF4E8", color: "#B35A00" }}>
            <UserCheck className="w-4 h-4 flex-none mt-0.5" />
            Si recibes el almuerzo que reservó otro compañero, el administrador te da el ingreso manual.
          </div>
        </Card.Content>
      </Card>

      {reservedToday && (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Ya realizaste tu reserva de hoy</Alert.Title>
            <Alert.Description>Te esperamos en el comedor de 12:00 m. a 1:30 p. m.</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Button size="lg" fullWidth isDisabled={!canReserve || reservedToday} onPress={handleStart} className="h-14 text-base font-bold">
        <UtensilsCrossed className="w-5 h-5" />
        {reservedToday ? "Ya reservaste hoy" : canReserve ? "Reservar almuerzo" : "Fuera de horario"}
      </Button>

      {!isWithinSchedule && !demoMode && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">Vuelve mañana entre 7:00 a. m. y 9:00 a. m. para realizar tu reserva.</p>
          <Button variant="ghost" size="sm" onPress={() => setDemoMode(true)} className="text-sara-green-dark">
            Ver demostración de la reserva y el pago
          </Button>
        </div>
      )}
      {demoMode && !isWithinSchedule && (
        <p className="text-center text-xs text-gray-500">Modo demostración activo: puedes recorrer la reserva fuera del horario.</p>
      )}
    </div>
  );
}
