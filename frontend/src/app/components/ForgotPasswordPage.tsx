import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Mail, CheckCircle2, Key } from "lucide-react";
import logoSena from "@/assets/sara-emblem.png";

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<"email" | "code" | "newPassword" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("El correo electrónico no es válido");
      return;
    }

    // Simulación de envío de código
    console.log("Código de recuperación enviado a:", email);
    setStep("code");
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Debes ingresar el código de verificación");
      return;
    }

    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    // Simulación de verificación de código (en producción se verificaría con el backend)
    if (code === "123456" || code.length === 6) {
      setStep("newPassword");
    } else {
      setError("Código incorrecto. Por favor verifica e intenta nuevamente.");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("La contraseña es requerida");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Simulación de cambio de contraseña
    console.log("Contraseña actualizada para:", email);
    setStep("success");
  };

  const handleResendCode = () => {
    setError("");
    console.log("Código de recuperación reenviado a:", email);
    // En producción, aquí se haría una llamada al backend
    alert("Código reenviado exitosamente a " + email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={logoSena} alt="SARA Logo" className="w-40 h-40 object-contain" />
          </div>
          <h1 className="text-3xl mb-2" style={{ color: '#39A900' }}>Recuperar contraseña</h1>
          <h2 className="text-xl" style={{ color: '#F27C00' }}>Sistema SARA</h2>
          <p className="text-gray-600 mt-2">Sigue los pasos para restablecer tu contraseña</p>
        </div>

        {step === "email" && (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#39A900' }}>Ingresa tu Correo</CardTitle>
              <CardDescription>
                Te enviaremos un código de verificación a tu correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu-correo@ejemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      className={`pl-10 ${emailError ? "border-red-500" : ""}`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un código de 6 dígitos.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackToLogin}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    style={{ backgroundColor: '#39A900' }}
                  >
                    Enviar Código
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "code" && (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#39A900' }}>Verificar Código</CardTitle>
              <CardDescription>
                Ingresa el código de 6 dígitos que enviamos a {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificación</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    maxLength={6}
                    className={`text-center text-2xl tracking-widest ${error ? "border-red-500" : ""}`}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm text-sara-green-dark hover:underline"
                  >
                    ¿No recibiste el código? Reenviar
                  </button>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Demo:</strong> Usa cualquier código de 6 dígitos para continuar
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("email")}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    style={{ backgroundColor: '#39A900' }}
                  >
                    Verificar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "newPassword" && (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#39A900' }}>Nueva Contraseña</CardTitle>
              <CardDescription>
                Ingresa tu nueva contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-10"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    Tu nueva contraseña debe tener al menos 6 caracteres
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("code")}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    style={{ backgroundColor: '#39A900' }}
                  >
                    Cambiar Contraseña
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#39A900' }}>¡Contraseña Actualizada!</CardTitle>
              <CardDescription>
                Tu contraseña ha sido cambiada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-center text-gray-600">
                  Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Por seguridad, asegúrate de no compartir tu contraseña con nadie.
                </AlertDescription>
              </Alert>

              <Button
                onClick={onBackToLogin}
                className="w-full"
                style={{ backgroundColor: '#39A900' }}
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2026 SENA - Servicio Nacional de Aprendizaje</p>
        </div>
      </div>
    </div>
  );
}
