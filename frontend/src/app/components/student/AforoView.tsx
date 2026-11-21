import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Users, TrendingUp, Clock } from "lucide-react";

export default function AforoView() {
  // Mock data - En producción vendría de una base de datos en tiempo real
  const currentOccupancy = 73;
  const maxCapacity = 110;
  const availableSpots = maxCapacity - currentOccupancy;
  const occupancyPercentage = (currentOccupancy / maxCapacity) * 100;

  const peakHours = [
    { time: "12:00 - 12:30", level: "Alto", color: "red" },
    { time: "12:30 - 13:00", level: "Alto", color: "red" },
    { time: "13:00 - 13:30", level: "Medio", color: "yellow" },
  ];

  const getStatusColor = () => {
    if (occupancyPercentage >= 90) return "bg-red-600";
    if (occupancyPercentage >= 70) return "bg-yellow-600";
    return "bg-green-600";
  };

  const getStatusText = () => {
    if (occupancyPercentage >= 90) return "Casi lleno";
    if (occupancyPercentage >= 70) return "Moderado";
    return "Disponible";
  };

  return (
    <div className="space-y-6">
      {/* Aforo Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-sara-green-dark" />
            Aforo en Tiempo Real
          </CardTitle>
          <CardDescription>Capacidad actual del restaurante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl">{currentOccupancy}</p>
              <p className="text-sm text-gray-600">Personas dentro</p>
            </div>
            <div className="text-right">
              <p className="text-4xl">{availableSpots}</p>
              <p className="text-sm text-gray-600">Espacios disponibles</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ocupación</span>
              <span>{Math.round(occupancyPercentage)}%</span>
            </div>
            <Progress value={occupancyPercentage} className="h-3" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <span className="text-sm text-gray-600">
              Capacidad máxima: {maxCapacity} personas
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Horarios Pico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Horarios de Mayor Afluencia
          </CardTitle>
          <CardDescription>
            Planifica tu visita según la ocupación esperada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peakHours.map((hour, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{hour.time}</span>
                </div>
                <Badge
                  className={
                    hour.color === "red"
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : hour.color === "yellow"
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                      : "bg-green-100 text-green-700 hover:bg-green-100"
                  }
                >
                  {hour.level}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Los horarios de menor ocupación son antes de las 12:00 m. y después de la 1:30 p. m.</p>
          <p>Reserva tu horario con anticipación para evitar esperas</p>
          <p>El sistema bloquea nuevos ingresos cuando se alcanza el límite de 110 personas</p>
          <p>Consulta el aforo en tiempo real antes de dirigirte al restaurante</p>
        </CardContent>
      </Card>
    </div>
  );
}
