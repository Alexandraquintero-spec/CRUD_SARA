import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User } from "../types";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  BookOpen,
  Briefcase,
  Settings,
  ChevronRight,
  Lock,
  Mail,
  Shield,
  Clock3,
  UtensilsCrossed,
  UsersRound,
  Wallet,
  Loader2,
} from "lucide-react";
import Brand from "./Brand";
import restaurantBg from "../../imports/WhatsApp_Image_2026-04-21_at_7.44.29_PM.jpeg";
import { iniciarSesion } from "../api";

interface LoginPageProps {
  onLogin: (user: User) => void;
  onForgotPassword: () => void;
  onBackToWelcome?: () => void;
}

type RoleType = "aprendiz" | "instructor" | "admin";

const ROLES: {
  id: RoleType;
  label: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: "aprendiz", label: "Aprendiz", sub: "Estudiante SENA", icon: <BookOpen className="w-4 h-4" />, color: "#39A900" },
  { id: "instructor", label: "Instructor", sub: "Personal docente", icon: <Briefcase className="w-4 h-4" />, color: "#F27C00" },
  { id: "admin", label: "Administrador", sub: "Gestión del sistema", icon: <Settings className="w-4 h-4" />, color: "#39A900" },
];

/** Usuarios de demostración para recorrer el prototipo sin la API en ejecución. */
const DEMO: Record<RoleType, User> = {
  aprendiz: { id: "demo-7", name: "Yeimy Quintero Suárez", role: "aprendiz", ficha: "3312744", beneficiary: false, documentType: "TI", documentNumber: "1023456781" },
  instructor: { id: "demo-3", name: "Carlos Andrés Mejía", role: "instructor" },
  admin: { id: "demo-1", name: "Alexandra Quintero Ríos", role: "admin" },
};

export default function LoginPage({
  onLogin,
  onForgotPassword,
  onBackToWelcome,
}: LoginPageProps) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sinApi, setSinApi] = useState(false);

  // Inicio de sesión real contra la API: POST /api/v1/auth/login (correo + contraseña)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!correo.trim() || !password) {
      setError("Ingresa tu correo y tu contraseña.");
      return;
    }
    setCargando(true);
    try {
      onLogin(await iniciarSesion(correo.trim(), password));
    } catch (err) {
      const status = (err as { status?: number }).status ?? 0;
      setSinApi(status === 0);
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* ── FONDO: imagen del restaurante desenfocada ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${restaurantBg})`,
          filter: "blur(4px)",
          transform: "scale(1.08)",
        }}
      />

      {/* ── OVERLAY de color con los tonos del logo ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,61,5,0.92) 0%, rgba(35,107,5,0.86) 50%, rgba(57,169,0,0.78) 100%)",
        }}
      />

      {/* ── Círculos decorativos difusos ── */}
      <div
        className="absolute top-[-120px] left-[-120px] w-[480px] h-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(57,169,0,0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,107,0,0.30) 0%, transparent 70%)",
        }}
      />

      {/* ── Botón volver ── */}
      {onBackToWelcome && (
        <button
          onClick={onBackToWelcome}
          className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 border border-white/25 px-3 py-2 rounded-xl backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      {/* ── TARJETA PRINCIPAL ── */}
      <div
        className="relative z-10 w-full max-w-4xl mx-4 rounded-3xl overflow-hidden shadow-2xl flex"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >

        {/* ── COLUMNA IZQUIERDA: identidad de marca ── */}
        <div
          className="hidden md:flex relative overflow-hidden flex-col items-start justify-between p-10 w-[320px] flex-shrink-0 text-white"
          style={{ background: "linear-gradient(160deg, #1A5208 0%, #2E8A00 60%, #39A900 100%)" }}
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-2xl opacity-40" style={{ background: "#F27C00" }} aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} aria-hidden="true" />

          <div className="relative space-y-6">
            <Brand size="md" tone="dark" subtitle="Sistema gastronómico SENA" />
            <p className="text-sm text-white/85 leading-relaxed">
              Reserva y paga tu almuerzo con Nequi, y entra al comedor con reconocimiento facial.
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Clock3, text: "Reservas de 7:00 a 9:00 a. m." },
                { icon: UtensilsCrossed, text: "Almuerzo de 12:00 m. a 1:30 p. m." },
                { icon: UsersRound, text: "Aforo máximo de 110 personas" },
                { icon: Wallet, text: "$5.000 por almuerzo" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative space-y-2 w-full">
            <p className="text-[11px] text-white/70 uppercase tracking-wider mb-2">Acceso para</p>
            {ROLES.map((r) => (
              <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/15">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0" style={{ color: r.color }}>
                  {r.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-[11px] text-white/75">{r.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: formulario ── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">

          {/* Logo mobile */}
          <div className="md:hidden mb-8">
            <Brand size="md" subtitle="Sistema gastronómico SENA" />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Iniciar sesión</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa con el correo y la contraseña que te asignó el administrador.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="correo" className="text-xs font-medium text-gray-700">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="correo"
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@soy.sena.edu.co"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="pl-10 h-11 rounded-xl text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-[#39A900]"
                  style={{ backgroundColor: "#f9fafb" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="contrasena" className="text-xs font-medium text-gray-700">Contraseña</Label>
                <button type="button" onClick={onForgotPassword} className="text-xs hover:underline text-[#2E8A00]">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contrasena"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-[#39A900]"
                  style={{ backgroundColor: "#f9fafb" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={cargando}
              className="w-full h-11 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-semibold"
              style={{ backgroundColor: "#39A900", boxShadow: "0 4px 20px #39A90050" }}
            >
              {cargando ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              {cargando ? "Verificando…" : "Ingresar"}
              {!cargando && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </form>

          {/* Modo demostración: solo aparece si la API no está disponible */}
          {sinApi && (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700">Explorar el prototipo sin la API</p>
              <p className="text-[11px] text-gray-500 mb-3">Entra con datos de demostración para recorrer las pantallas.</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onLogin(DEMO[r.id])}
                    className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-2.5 hover:border-gray-400 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: r.color }}>
                      {r.icon}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-700">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aviso institucional */}
          <div
            className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{
              backgroundColor: "rgba(57,169,0,0.12)",
              border: "1px solid rgba(57,169,0,0.25)",
              color: "#4b5563",
            }}
          >
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: "#39A900" }} />
            Las cuentas las crea el administrador del servicio; tu rol se asigna automáticamente.
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "#9ca3af" }}>
            © 2026 SENA – Servicio Nacional de Aprendizaje
          </p>
        </div>
      </div>
    </div>
  );
}
