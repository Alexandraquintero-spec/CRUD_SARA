import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Users, AlertTriangle, Clock } from "lucide-react";

interface AforoEntry {
  hora: string;
  entrada: number;
  salida: number;
  actual: number;
}

export default function AforoControl() {
  const AFORO_MAXIMO = 110;
  
  const [currentOccupancy, setCurrentOccupancy] = useState(73);
  const [entries, setEntries] = useState<AforoEntry[]>([
    { hora: "12:00", entrada: 15, salida: 0, actual: 15 },
    { hora: "12:15", entrada: 22, salida: 5, actual: 32 },
    { hora: "12:30", entrada: 28, salida: 12, actual: 48 },
    { hora: "12:45", entrada: 25, salida: 8, actual: 65 },
    { hora: "13:00", entrada: 18, salida: 10, actual: 73 },
  ]);

  const occupancyPercentage = (currentOccupancy / AFORO_MAXIMO) * 100;
  const availableSpots = AFORO_MAXIMO - currentOccupancy;

  const getStatusColor = () => {
    if (occupancyPercentage >= 90) return "bg-red-600";
    if (occupancyPercentage >= 70) return "bg-yellow-600";
    return "bg-green-600";
  };

  const getStatusText = () => {
    if (occupancyPercentage >= 90) return "Crítico - Casi lleno";
    if (occupancyPercentage >= 70) return "Moderado";
    return "Disponible";
  };

  return (
    <div className="space-y-6">
      {/* Control principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-sara-green-dark" />
            Control de aforo en Tiempo Real
          </CardTitle>
          <CardDescription>
            Capacidad máxima: {AFORO_MAXIMO} personas • Actualización automática mediante reconocimiento facial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-5xl mb-2">{currentOccupancy}</p>
              <p className="text-sm text-gray-600">Personas dentro</p>
            </div>
            <div className="text-center">
              <p className="text-5xl mb-2 text-green-600">{availableSpots}</p>
              <p className="text-sm text-gray-600">Espacios disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-5xl mb-2 text-sara-green-dark">{AFORO_MAXIMO}</p>
              <p className="text-sm text-gray-600">Capacidad máxima</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ocupación</span>
              <span>{Math.round(occupancyPercentage)}%</span>
            </div>
            <Progress value={occupancyPercentage} className="h-4" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          <div className="bg-sara-green-50 border border-sara-green-100 rounded-lg p-4">
            <p className="text-sm text-center">
              <strong>Sistema Automático:</strong> El registro de entradas y salidas se realiza mediante reconocimiento facial
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alerta de aforo */}
      {occupancyPercentage >= 90 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-900">Aforo crítico alcanzado</p>
                <p className="text-sm text-red-700 mt-1">
                  Se debe bloquear el ingreso de nuevas personas hasta que se liberen mesas.
                  Solo quedan {availableSpots} espacios disponibles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registro por horarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registro por Intervalos de 15 Minutos
          </CardTitle>
          <CardDescription>
            Control de entradas y salidas durante el día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50"
              >
                <div>
                  <p className="text-sm text-gray-600">Horario</p>
                  <p>{entry.hora}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entradas</p>
                  <p className="text-green-600">+{entry.entrada}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salidas</p>
                  <p className="text-red-600">-{entry.salida}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ocupación</p>
                  <p>
                    <Badge className={entry.actual >= AFORO_MAXIMO * 0.9 ? "bg-red-600" : "bg-sara-green"}>
                      {entry.actual} personas
                    </Badge>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestión de fila */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Fila de Espera</CardTitle>
          <CardDescription>
            Control del orden de llegada según horarios establecidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>El sistema organiza automáticamente la fila por horarios reservados</p>
          <p>Seguimiento por intervalos de 15 minutos desde las 12:00 m.</p>
          <p>Se bloquean nuevos ingresos al alcanzar {AFORO_MAXIMO} personas</p>
          <p>Coordinación automática con las reservas del día</p>
          <p>Previene colados y mantiene el orden establecido</p>
        </CardContent>
      </Card>

      {/* Información normativa */}
      <Card>
        <CardHeader>
          <CardTitle>Normativa de Aforo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Aforo máximo permitido:</span>
            <span>{AFORO_MAXIMO} personas</span>
          </div>
          <div className="flex justify-between">
            <span>Base normativa:</span>
            <span>Normativa interna SENA</span>
          </div>
          <div className="flex justify-between">
            <span>Método de control:</span>
            <span>Digital + Manual</span>
          </div>
          <div className="flex justify-between">
            <span>Intervalos de registro:</span>
            <span>Cada 15 minutos</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
