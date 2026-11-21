import { Alert, Button, Card, Chip, Link } from "@heroui/react";
import {
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Users,
  LogIn,
  Clock,
  Lightbulb,
  Shield,
  BookOpen,
  Briefcase,
  Settings,
  ArrowRight,
  CheckCircle2,
  Warehouse,
  Wallet,
  BadgeCheck,
  Sparkles,
  MapPin,
  ScanFace,
  XCircle,
  Info,
  UserCheck,
} from "lucide-react";
import Brand from "./Brand";
import emblem from "@/assets/sara-emblem.png";
import restaurantBg from "../../imports/WhatsApp_Image_2026-04-21_at_7.44.29_PM.jpeg";

interface WelcomePageProps {
  onNavigateToLogin: () => void;
}

/* Paleta de marca */
const G = { 900: "#123D05", 800: "#1A5208", 700: "#236B05", 600: "#2E8A00", 500: "#39A900", 100: "#DDF2CF", 50: "#F1FAEB" };
const O = { 700: "#B35A00", 600: "#DB6E00", 500: "#F27C00", 300: "#FFC27A", 100: "#FFE3C2", 50: "#FFF4E8" };
const CREAM = "#FFFBF5";

const features = [
  { icon: UtensilsCrossed, title: "Reserva y pago con Nequi", desc: "Reserva entre las 7:00 y las 9:00 a. m. y paga escaneando el QR de Nequi en pantalla.", color: G[500] },
  { icon: ScanFace, title: "Ingreso con reconocimiento facial", desc: "Te paras frente a la cámara y el sistema valida tu reserva en segundos. Sin filas ni papeles.", color: O[500] },
  { icon: ShoppingBag, title: "Tienda agrícola", desc: "Productos frescos cultivados por los aprendices del programa.", color: G[600] },
  { icon: Calendar, title: "Menú del día", desc: "Consulta los platos y sus ingredientes antes de reservar.", color: O[600] },
  { icon: Users, title: "Control de aforo", desc: "El ingreso se controla en tiempo real hasta 110 personas.", color: G[500] },
  { icon: Lightbulb, title: "Buzón de observaciones", desc: "Envía tus ideas para mejorar el servicio. El administrador responde.", color: O[500] },
];

const roles = [
  { label: "Aprendiz", sub: "Reserva tu almuerzo y entra con tu rostro.", icon: BookOpen, from: G[600], to: G[500], check: G[600], perks: ["Reservar almuerzo", "Ingreso con reconocimiento facial", "Tienda agrícola", "Buzón de observaciones"] },
  { label: "Instructor", sub: "Registra tus consumos y revisa tu deuda.", icon: Briefcase, from: O[600], to: O[500], check: O[600], perks: ["Registrar consumo", "Consultar deuda", "Consultar menú", "Observaciones"] },
  { label: "Administrador", sub: "Gestiona el servicio y consulta los reportes.", icon: Settings, from: G[800], to: G[600], check: G[700], perks: ["Inventario con códigos", "Reportes y deudas", "Gestión de cuentas", "Ingreso manual al comedor"] },
];

const stats = [
  { value: "110", label: "Aforo máximo" },
  { value: "$5.000", label: "Por almuerzo" },
  { value: "7–9 a. m.", label: "Reservas" },
  { value: "12–1:30 p. m.", label: "Almuerzo" },
];

/* Divisor ondulado entre secciones */
function Wave({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block w-full h-14 md:h-20" aria-hidden="true">
      <path d="M0 80h1440V36c-180 26-360 40-560 28C640 50 420 4 220 6 130 7 60 18 0 30v50z" fill={fill} />
    </svg>
  );
}

export default function WelcomePage({ onNavigateToLogin }: WelcomePageProps) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen overflow-x-hidden text-sara-ink" style={{ backgroundColor: CREAM }}>
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(17,24,28,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Brand size="sm" />
          <div className="hidden md:flex items-center gap-1 text-sm">
            {[
              ["funcionalidades", "Funcionalidades"],
              ["perfiles", "Perfiles"],
              ["ingreso", "Ingreso"],
              ["sobre", "Sobre SARA"],
            ].map(([id, label]) => (
              <Link
                key={id}
                onPress={() => scrollTo(id)}
                className="px-3 py-2 rounded-xl text-gray-700 no-underline hover:bg-sara-green-50 hover:text-sara-green-dark cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-sara-orange" />
            SENA · Yamboró, Pitalito
          </span>
        </div>
      </nav>

      {/* ── HERO (bloque de marca) ── */}
      <section className="relative pt-16 overflow-hidden" style={{ background: `linear-gradient(135deg, ${G[900]} 0%, ${G[700]} 45%, ${G[500]} 100%)` }}>
        {/* Foto del edificio integrada al color de marca */}
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity" style={{ backgroundImage: `url(${restaurantBg})` }} aria-hidden="true" />
        {/* Luces de color suaves */}
        <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-40" style={{ background: O[500] }} aria-hidden="true" />
        <div className="absolute bottom-0 -left-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-30" style={{ background: G[500] }} aria-hidden="true" />
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "22px 22px" }} aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center pt-16 pb-28 lg:pt-24 lg:pb-36">
          <div className="space-y-7 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
              <BadgeCheck className="w-4 h-4" style={{ color: O[300] }} />
              Sistema oficial SENA · Gastronomía
            </span>

            <h1 className="text-5xl lg:text-[64px] font-extrabold leading-[1.02] tracking-tight">
              Gestión
              <br />
              Gastronómica
              <br />
              <span className="relative inline-block" style={{ color: O[300] }}>
                Inteligente
                <svg viewBox="0 0 300 14" className="absolute -bottom-2 left-0 w-full h-3" aria-hidden="true">
                  <path d="M2 10 C 80 2, 200 2, 298 8" stroke={O[500]} strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-white/85 max-w-xl leading-relaxed">
              Reserva y paga tu almuerzo con Nequi desde la plataforma, y entra al comedor con reconocimiento facial, sin filas ni papeles.
              Todo el restaurante del SENA en una sola plataforma.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onPress={onNavigateToLogin} className="bg-white font-semibold shadow-xl shadow-black/20 hover:bg-white" style={{ color: G[700] }}>
                <LogIn className="w-5 h-5" />
                Ingresar al sistema
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="ghost" onPress={() => scrollTo("funcionalidades")} className="text-white hover:bg-white/10">
                Conocer más
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-2xl">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur">
                  <p className="text-lg font-bold leading-tight whitespace-nowrap">{s.value}</p>
                  <p className="text-[11px] text-white/70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta "Hoy en el restaurante" (informativa, sin botón) */}
          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-3 rounded-[32px] bg-white/10 backdrop-blur-sm" aria-hidden="true" />
              <Card className="relative shadow-2xl shadow-black/25 border-0 rounded-3xl">
                <Card.Header className="flex flex-row items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Hoy en el restaurante</p>
                    <Card.Title className="text-lg font-bold">Menú del día</Card.Title>
                  </div>
                  <Chip color="success" variant="soft" size="sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-sara-green" />
                    <Chip.Label>Abierto</Chip.Label>
                  </Chip>
                </Card.Header>
                <Card.Content className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl p-3" style={{ backgroundColor: O[50] }}>
                    <span className="w-11 h-11 flex-none rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${O[600]}, ${O[500]})` }}>
                      <UtensilsCrossed className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Pollo al horno con arroz</p>
                      <p className="text-xs text-gray-500">Sopa de verduras · Ensalada · Jugo de mora</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-sara-line p-3">
                      <p className="text-[11px] text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Reservas</p>
                      <p className="text-sm font-semibold mt-0.5">7:00–9:00 a. m.</p>
                    </div>
                    <div className="rounded-2xl border border-sara-line p-3">
                      <p className="text-[11px] text-gray-500 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />Precio</p>
                      <p className="text-sm font-semibold mt-0.5">$5.000</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" />Aforo actual</span>
                      <span className="font-semibold">72 / 110</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-sara-green-50 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: "65%", background: `linear-gradient(90deg, ${G[500]}, ${O[500]})` }} />
                    </div>
                  </div>
                </Card.Content>
              </Card>
              <div className="absolute -bottom-14 -left-10 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: G[500] }}>
                  <ScanFace className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Ingreso verificado</p>
                  <p className="text-[11px] text-gray-500">Reserva confirmada · puedes seguir</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0">
          <Wave fill={CREAM} />
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" className="relative py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: O[600] }}>Funcionalidades</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
              Todo el restaurante, <span style={{ color: G[600] }}>en tu bolsillo</span>
            </h2>
            <p className="mt-3 text-gray-600 text-lg">Herramientas pensadas para aprendices, instructores y el equipo del restaurante.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="group relative overflow-hidden border border-sara-line shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-3xl">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: f.color }} aria-hidden="true" />
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: f.color, boxShadow: `0 10px 20px -8px ${f.color}` }}>
                  <f.icon className="w-6 h-6" />
                </span>
                <Card.Header>
                  <Card.Title className="text-lg font-bold">{f.title}</Card.Title>
                  <Card.Description className="leading-relaxed text-gray-600">{f.desc}</Card.Description>
                </Card.Header>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASÍ ENTRAS AL COMEDOR ── */}
      <section id="ingreso" className="relative py-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: O[600] }}>Ingreso al comedor</p>
              <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
                Tu rostro es tu <span style={{ color: G[600] }}>entrada</span>
              </h2>
              <p className="mt-3 text-gray-600 text-lg leading-relaxed">
                No necesitas mostrar nada. Reservas tu almuerzo en la mañana y al mediodía solo te
                paras frente a la cámara del comedor.
              </p>
              <ol className="mt-8 space-y-4">
                {[
                  { n: "1", t: "Reserva y paga tu almuerzo", d: "Entre las 7:00 y las 9:00 a. m., con el QR de Nequi que aparece en la plataforma." },
                  { n: "2", t: "Párate frente a la cámara", d: "El sistema lee tus rasgos faciales y busca tu reserva del día." },
                  { n: "3", t: "Sigue la indicación de la pantalla", d: "En verde puedes seguir; en rojo te indica por qué no puedes ingresar." },
                ].map((st) => (
                  <li key={st.n} className="flex gap-4">
                    <span className="w-10 h-10 flex-none rounded-2xl flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${G[600]}, ${G[500]})` }}>{st.n}</span>
                    <div>
                      <p className="font-semibold">{st.t}</p>
                      <p className="text-sm text-gray-600">{st.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Card className="rounded-3xl border-0 shadow-xl overflow-hidden p-0 gap-0">
                <div className="px-6 py-8 text-white text-center" style={{ background: `linear-gradient(135deg, ${G[600]}, ${G[500]})` }}>
                  <span className="mx-auto w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </span>
                  <p className="mt-4 text-xl font-extrabold">Acceso permitido</p>
                  <p className="text-sm text-white/85">Tienes reserva para hoy. Puedes seguir.</p>
                </div>
                <div className="px-6 py-4 bg-white text-sm text-gray-600 flex items-center gap-2">
                  <ScanFace className="w-4 h-4" style={{ color: G[600] }} />
                  Rostro verificado · reserva confirmada
                </div>
              </Card>
              <Card className="rounded-3xl border-0 shadow-xl overflow-hidden p-0 gap-0">
                <div className="px-6 py-8 text-white text-center" style={{ background: "linear-gradient(135deg, #C8102E, #E5484D)" }}>
                  <span className="mx-auto w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                    <XCircle className="w-8 h-8" />
                  </span>
                  <p className="mt-4 text-xl font-extrabold">Acceso denegado</p>
                  <p className="text-sm text-white/85">No tienes reserva para hoy.</p>
                </div>
                <div className="px-6 py-4 bg-white text-sm text-gray-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-500" />
                  La pantalla siempre indica el motivo
                </div>
              </Card>
              <Alert status="warning" className="sm:col-span-2 rounded-2xl">
                <Alert.Indicator>
                  <UserCheck className="w-4 h-4" />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>Ingreso manual por el administrador</Alert.Title>
                  <Alert.Description>
                    Si un aprendiz recibió el almuerzo que reservó otro compañero, el administrador
                    puede darle el ingreso manualmente desde su panel.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERFILES ── */}
      <section id="perfiles" className="relative py-20" style={{ background: `linear-gradient(180deg, ${CREAM} 0%, ${G[50]} 100%)` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: G[600] }}>Perfiles</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
              Un panel para <span style={{ color: O[500] }}>cada rol</span>
            </h2>
            <p className="mt-3 text-gray-600 text-lg">Cada usuario ve solo lo que necesita para su día a día.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <Card key={r.label} className="overflow-hidden p-0 gap-0 border-0 shadow-lg hover:shadow-2xl transition-shadow rounded-3xl">
                <div className="relative px-6 pt-6 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} aria-hidden="true" />
                  <span className="relative w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                    <r.icon className="w-6 h-6" />
                  </span>
                  <h3 className="relative mt-4 text-2xl font-extrabold">{r.label}</h3>
                  <p className="relative text-sm text-white/85 mt-1">{r.sub}</p>
                </div>
                <div className="px-6 py-5 bg-white">
                  <ul className="space-y-2.5">
                    {r.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: r.check }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE SARA (bloque de color contenido) ── */}
      <section id="sobre" className="py-20" style={{ backgroundColor: G[50] }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[36px] px-8 py-12 md:px-14 md:py-14 text-white shadow-2xl" style={{ background: `linear-gradient(120deg, ${G[800]} 0%, ${G[600]} 55%, ${O[600]} 130%)` }}>
            <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute right-24 -top-10 w-40 h-40 rounded-full bg-white/5" aria-hidden="true" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: O[300] }} />
                  Sobre el sistema
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                  Gestión centralizada del <span style={{ color: O[300] }}>restaurante SENA</span>
                </h2>
                <p className="text-white/85 leading-relaxed">
                  SARA es la plataforma de gestión gastronómica del SENA. El administrador crea y
                  gestiona los perfiles de usuario, lo que garantiza seguridad y control institucional.
                </p>
                <Alert status="success" className="bg-white text-sara-ink shadow-lg">
                  <Alert.Indicator>
                    <Shield className="w-4 h-4" />
                  </Alert.Indicator>
                  <Alert.Content>
                    <Alert.Title>Acceso gestionado por el administrador</Alert.Title>
                    <Alert.Description>Si necesitas acceso, contacta al área de gastronomía del SENA.</Alert.Description>
                  </Alert.Content>
                </Alert>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: UtensilsCrossed, label: "Almuerzos gestionados", value: "Diario" },
                  { icon: Users, label: "Aforo controlado", value: "110 personas" },
                  { icon: Warehouse, label: "Inventario", value: "En tiempo real" },
                  { icon: ScanFace, label: "Ingreso facial", value: "En segundos" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl bg-white/10 border border-white/20 p-5 backdrop-blur">
                    <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      <item.icon className="w-5 h-5" style={{ color: G[600] }} />
                    </span>
                    <p className="mt-3 font-bold">{item.value}</p>
                    <p className="text-xs text-white/75">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIENVENIDA ── */}
      <section className="relative pt-20 pb-32 overflow-hidden" style={{ background: `linear-gradient(180deg, ${G[50]} 0%, ${O[50]} 100%)` }}>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <img src={emblem} alt="Emblema de SARA" className="w-24 h-24 object-contain mx-auto drop-shadow-xl" />
          <h2 className="mt-5 text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Bienvenido a <span style={{ color: G[600] }}>SA</span><span style={{ color: O[500] }}>RA</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Ingresa con las credenciales que te entregó el administrador y usa todas las funciones
            del sistema gastronómico SENA.
          </p>
        </div>
        <div className="absolute bottom-0 inset-x-0">
          <Wave fill={G[800]} />
        </div>
      </section>

      {/* ── PIE DE PÁGINA ── */}
      <footer className="text-white" style={{ backgroundColor: G[800] }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Brand size="sm" tone="dark" subtitle="Sistema de Gestión Gastronómica del SENA" />
          <p className="text-xs text-white/70">© 2026 SENA, Servicio Nacional de Aprendizaje. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
