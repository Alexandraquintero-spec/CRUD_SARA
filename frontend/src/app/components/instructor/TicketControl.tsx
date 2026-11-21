import { useMemo, useState } from "react";
import { Alert, Button, Card, Chip } from "@heroui/react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  ScanFace,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRightLeft,
  Users,
} from "lucide-react";

/*
 * Control de ingreso al comedor (antes "Boletas").
 * En SARA no hay boletas ni códigos QR: el aprendiz reserva y entra con
 * reconocimiento facial. El administrador puede dar un ingreso manual cuando
 * un aprendiz recibe el almuerzo que reservó otro compañero.
 */

type Metodo = "facial" | "manual";
type Resultado = "permitido" | "denegado";

interface Ingreso {
  id: string;
  hora: string;
  aprendiz: string;
  ficha: string;
  metodo: Metodo;
  resultado: Resultado;
  detalle: string;
}

interface Reserva {
  documento: string;
  nombre: string;
  ficha: string;
  ingreso: boolean;
}

const G500 = "#39A900";
const G600 = "#2E8A00";
const O500 = "#F27C00";

const RESERVAS_INICIALES: Reserva[] = [
  { documento: "1001234567", nombre: "Valentina Torres Ríos", ficha: "2891234", ingreso: true },
  { documento: "1002345678", nombre: "Juan Pérez Muñoz", ficha: "2891256", ingreso: false },
  { documento: "1003456789", nombre: "Laura Gómez Díaz", ficha: "2891234", ingreso: true },
  { documento: "1004567890", nombre: "Andrés Rojas León", ficha: "2891256", ingreso: false },
];

const INGRESOS_INICIALES: Ingreso[] = [
  { id: "i1", hora: "12:05 p. m.", aprendiz: "Valentina Torres Ríos", ficha: "2891234", metodo: "facial", resultado: "permitido", detalle: "Coincidencia 98 %" },
  { id: "i2", hora: "12:04 p. m.", aprendiz: "Carlos Méndez", ficha: "2891256", metodo: "facial", resultado: "denegado", detalle: "Sin reserva para hoy" },
  { id: "i3", hora: "12:01 p. m.", aprendiz: "Laura Gómez Díaz", ficha: "2891234", metodo: "facial", resultado: "permitido", detalle: "Coincidencia 96 %" },
];

export default function TicketControl() {
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_INICIALES);
  const [ingresos, setIngresos] = useState<Ingreso[]>(INGRESOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [titular, setTitular] = useState<Reserva | null>(null);
  const [receptor, setReceptor] = useState({ nombre: "", documento: "", ficha: "" });
  const [filtro, setFiltro] = useState<"todos" | Resultado>("todos");

  const stats = useMemo(() => {
    const totalReservas = reservas.length;
    const ingresaron = reservas.filter((r) => r.ingreso).length;
    return {
      totalReservas,
      ingresaron,
      pendientes: totalReservas - ingresaron,
      manuales: ingresos.filter((i) => i.metodo === "manual").length,
      denegados: ingresos.filter((i) => i.resultado === "denegado").length,
    };
  }, [reservas, ingresos]);

  const coincidencias = busqueda.trim()
    ? reservas.filter(
        (r) =>
          !r.ingreso &&
          (r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || r.documento.includes(busqueda) || r.ficha.includes(busqueda)),
      )
    : [];

  const registrarIngresoManual = () => {
    if (!titular) {
      toast.error("Selecciona la reserva", { description: "Busca al aprendiz que reservó el almuerzo." });
      return;
    }
    if (!receptor.nombre.trim() || !receptor.documento.trim()) {
      toast.error("Faltan datos", { description: "Escribe el nombre y el documento del aprendiz que va a ingresar." });
      return;
    }
    const hora = new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
    setIngresos((prev) => [
      {
        id: `m-${Date.now()}`,
        hora,
        aprendiz: receptor.nombre.trim(),
        ficha: receptor.ficha.trim() || "—",
        metodo: "manual",
        resultado: "permitido",
        detalle: `Almuerzo cedido por ${titular.nombre}`,
      },
      ...prev,
    ]);
    setReservas((prev) => prev.map((r) => (r.documento === titular.documento ? { ...r, ingreso: true } : r)));
    toast.success("Ingreso manual registrado", { description: `${receptor.nombre.trim()} puede seguir al comedor.` });
    setTitular(null);
    setBusqueda("");
    setReceptor({ nombre: "", documento: "", ficha: "" });
  };

  const ingresosFiltrados = ingresos.filter((i) => filtro === "todos" || i.resultado === filtro);

  return (
    <div className="space-y-6">
      {/* Almuerzos a preparar */}
      <Card className="overflow-hidden p-0 gap-0 rounded-3xl border-0 shadow-lg">
        <div className="relative px-6 py-7 md:px-8 text-white" style={{ background: `linear-gradient(120deg, #1A5208 0%, ${G600} 60%, ${G500} 100%)` }}>
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7" />
              </span>
              <div>
                <p className="text-sm text-white/80">Almuerzos a preparar hoy</p>
                <p className="text-5xl font-extrabold leading-none mt-1">{stats.totalReservas}</p>
                <p className="text-xs text-white/75 mt-1">Según las reservas confirmadas entre 7:00 y 9:00 a. m.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Ya ingresaron", value: stats.ingresaron },
                { label: "Por ingresar", value: stats.pendientes },
                { label: "Manuales", value: stats.manuales },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-white/75">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
        {/* Ingreso manual */}
        <Card className="rounded-3xl border border-sara-line">
          <Card.Header>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: O500 }}>
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <Card.Title className="text-lg font-bold">Ingreso manual</Card.Title>
                <Card.Description>Cuando un aprendiz recibe el almuerzo que reservó otro compañero.</Card.Description>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="space-y-1.5">
              <Label>1. Aprendiz que reservó el almuerzo</Label>
              {titular ? (
                <div className="flex items-center justify-between rounded-2xl border border-sara-green-100 bg-sara-green-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{titular.nombre}</p>
                    <p className="text-xs text-gray-500">Doc. {titular.documento} · Ficha {titular.ficha}</p>
                  </div>
                  <Button size="sm" variant="ghost" onPress={() => setTitular(null)}>Cambiar</Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, documento o ficha" className="pl-9" />
                  </div>
                  {busqueda.trim() && (
                    <div className="rounded-2xl border border-sara-line divide-y divide-sara-line overflow-hidden">
                      {coincidencias.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">No hay reservas pendientes con ese dato.</p>
                      ) : (
                        coincidencias.map((r) => (
                          <button
                            key={r.documento}
                            type="button"
                            onClick={() => setTitular(r)}
                            className="w-full text-left px-4 py-3 hover:bg-sara-green-50 transition-colors"
                          >
                            <p className="text-sm font-medium">{r.nombre}</p>
                            <p className="text-xs text-gray-500">Doc. {r.documento} · Ficha {r.ficha} · Reserva sin usar</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ArrowRightLeft className="w-4 h-4" style={{ color: O500 }} />
              El almuerzo pasa al aprendiz que va a ingresar
            </div>

            <div className="space-y-3">
              <Label>2. Aprendiz que va a ingresar</Label>
              <Input value={receptor.nombre} onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })} placeholder="Nombre completo" />
              <div className="grid grid-cols-2 gap-3">
                <Input value={receptor.documento} onChange={(e) => setReceptor({ ...receptor, documento: e.target.value })} placeholder="Documento" />
                <Input value={receptor.ficha} onChange={(e) => setReceptor({ ...receptor, ficha: e.target.value })} placeholder="Ficha" />
              </div>
            </div>

            <Button size="lg" fullWidth onPress={registrarIngresoManual}>
              <CheckCircle2 className="w-5 h-5" />
              Dar ingreso manual
            </Button>
          </Card.Content>
        </Card>

        {/* Cómo funciona */}
        <div className="space-y-4">
          <Card className="rounded-3xl border border-sara-line">
            <Card.Header>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: G500 }}>
                  <ScanFace className="w-5 h-5" />
                </span>
                <div>
                  <Card.Title className="text-lg font-bold">Ingreso con reconocimiento facial</Card.Title>
                  <Card.Description>Así valida el kiosco a cada aprendiz.</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${G600}, ${G500})` }}>
                <CheckCircle2 className="w-6 h-6" />
                <p className="mt-2 font-bold">Verde</p>
                <p className="text-xs text-white/85">Tiene reserva: sigue al comedor.</p>
              </div>
              <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #C8102E, #E5484D)" }}>
                <XCircle className="w-6 h-6" />
                <p className="mt-2 font-bold">Rojo</p>
                <p className="text-xs text-white/85">La pantalla indica el motivo.</p>
              </div>
            </Card.Content>
          </Card>
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Sin boletas ni códigos QR</Alert.Title>
              <Alert.Description>
                Los aprendices no muestran nada al ingresar. Cada ingreso, facial o manual, queda registrado con la hora.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      </div>

      {/* Registro de ingresos */}
      <Card className="rounded-3xl border border-sara-line">
        <Card.Header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F1FAEB", color: G600 }}>
              <Users className="w-5 h-5" />
            </span>
            <div>
              <Card.Title className="text-lg font-bold">Registro de ingresos de hoy</Card.Title>
              <Card.Description>{ingresos.length} intentos · {stats.denegados} denegados</Card.Description>
            </div>
          </div>
          <div className="inline-flex gap-1 rounded-2xl bg-surface-secondary p-1">
            {(["todos", "permitido", "denegado"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={`px-3 h-8 rounded-xl text-xs font-medium transition-colors ${filtro === f ? "bg-sara-green text-white shadow" : "text-gray-500 hover:text-sara-ink"}`}
              >
                {f === "todos" ? "Todos" : f === "permitido" ? "Permitidos" : "Denegados"}
              </button>
            ))}
          </div>
        </Card.Header>
        <Card.Content>
          <div className="divide-y divide-sara-line">
            {ingresosFiltrados.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-9 h-9 flex-none rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: i.metodo === "facial" ? G500 : O500 }}
                  >
                    {i.metodo === "facial" ? <ScanFace className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{i.aprendiz}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {i.hora} · Ficha {i.ficha} · {i.detalle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <Chip size="sm" variant="secondary">
                    <Chip.Label>{i.metodo === "facial" ? "Facial" : "Manual"}</Chip.Label>
                  </Chip>
                  <Chip size="sm" color={i.resultado === "permitido" ? "success" : "danger"} variant="soft">
                    <Chip.Label>{i.resultado === "permitido" ? "Permitido" : "Denegado"}</Chip.Label>
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
