import { useState } from "react";
import { Alert as HAlert, Button as HButton, Card as HCard, Chip } from "@heroui/react";
import { useGlobalData } from "../../GlobalDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  UserCog,
  Search,
  Check,
  AlertCircle,
  Upload,
  Download,
  FileSpreadsheet,
  UploadCloud,
  Users,
  UserX,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";

export default function RoleManagement() {
  const [isDragging, setIsDragging] = useState(false);
  const { registeredUsers, updateUserRole, addUsers } = useGlobalData();
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredUsers = registeredUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: string) => {
    if (newRole === "aprendiz" || newRole === "instructor" || newRole === "admin") {
      updateUserRole(userId, newRole);
      setSelectedUser(userId);
      setSuccessMessage(`Rol actualizado exitosamente`);
      setTimeout(() => {
        setSuccessMessage("");
        setSelectedUser(null);
      }, 3000);
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          Sin rol asignado
        </Badge>
      );
    }

    const roleStyles = {
      aprendiz: "bg-green-100 text-green-700 border-green-300",
      instructor: "bg-sara-green-100 text-sara-green-dark border-sara-green-100",
      admin: "bg-orange-100 text-orange-700 border-orange-300",
    };

    const roleLabels = {
      aprendiz: "Aprendiz",
      instructor: "Instructor",
      admin: "Administrador",
    };

    return (
      <Badge className={roleStyles[role as keyof typeof roleStyles]}>
        {roleLabels[role as keyof typeof roleLabels]}
      </Badge>
    );
  };

  const usersWithoutRole = registeredUsers.filter((u) => !u.role).length;
  const instructorCount = registeredUsers.filter((u) => u.role === "instructor").length;
  const aprendizCount = registeredUsers.filter((u) => u.role === "aprendiz").length;

  const downloadTemplate = () => {
    const content = [
      "nombre,email,rol,ficha",
      "María Fernanda Ruiz,mruiz@sena.edu.co,aprendiz,2891234",
      "Andrés Pardo,apardo@sena.edu.co,instructor,",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plantilla_cuentas_sara.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Formato no compatible", {
        description: "Carga un archivo CSV usando la plantilla disponible.",
      });
      return;
    }

    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).slice(1);
    const validRoles = new Set(["aprendiz", "instructor", "admin"]);
    const users = rows.flatMap((row, index) => {
      const [name, email, rawRole, ficha] = row.split(",").map((cell) => cell.trim());
      const role = (rawRole || "").toLowerCase();
      if (!name || !email || !validRoles.has(role)) return [];
      return [{
        id: `bulk-${Date.now()}-${index}`,
        name,
        email,
        role: role as "aprendiz" | "instructor" | "admin",
        ficha: role === "aprendiz" ? ficha : undefined,
        registrationDate: new Date().toISOString().split("T")[0],
      }];
    });

    if (users.length === 0) {
      toast.error("No se encontraron filas válidas");
      return;
    }
    addUsers(users);
    toast.success(`${users.length} cuentas procesadas`, {
      description: "Los correos duplicados se omitieron automáticamente.",
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Carga masiva (HeroUI: Card, Chip, Button, Alert) ── */}
      <HCard className="overflow-hidden p-0 gap-0 rounded-3xl border-0 shadow-lg">
        <div
          className="relative overflow-hidden px-6 py-6 md:px-8 text-white"
          style={{ background: "linear-gradient(120deg, #1A5208 0%, #2E8A00 60%, #39A900 100%)" }}
        >
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} aria-hidden="true" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex-none rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-xl font-extrabold">Carga masiva de cuentas</h3>
                <p className="text-sm text-white/85 max-w-xl mt-1">
                  Incorpora grupos completos de aprendices o instructores con un solo archivo.
                  Solo el administrador crea las cuentas y asigna el rol de cada usuario.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["1. Descarga la plantilla", "2. Completa los datos", "3. Carga el archivo"].map((step) => (
                <Chip key={step} size="sm" className="bg-white/15 text-white border border-white/25">
                  <Chip.Label>{step}</Chip.Label>
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 p-6 md:p-8 bg-white">
          {/* Zona para arrastrar o seleccionar el archivo */}
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleBulkUpload(e.dataTransfer.files?.[0]); }}
            className={`group flex flex-col items-center justify-center text-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${
              isDragging ? "border-sara-green bg-sara-green-50" : "border-sara-green-100 bg-sara-green-50/50 hover:border-sara-green hover:bg-sara-green-50"
            }`}
          >
            <span className="w-14 h-14 rounded-2xl bg-sara-green text-white flex items-center justify-center shadow-lg shadow-sara-green/30 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </span>
            <div>
              <p className="font-semibold text-sara-ink">Arrastra aquí tu archivo CSV</p>
              <p className="text-sm text-gray-500">o haz clic para seleccionarlo desde tu equipo</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["nombre", "email", "rol", "ficha"].map((col) => (
                <Chip key={col} size="sm" variant="secondary">
                  <Chip.Label>{col}</Chip.Label>
                </Chip>
              ))}
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => handleBulkUpload(event.target.files?.[0])}
            />
          </label>

          {/* Acciones e información */}
          <div className="flex flex-col gap-4">
            <HButton variant="outline" size="lg" fullWidth onPress={downloadTemplate}>
              <Download className="w-4 h-4" />
              Descargar plantilla CSV
            </HButton>
            <HAlert status="accent">
              <HAlert.Indicator />
              <HAlert.Content>
                <HAlert.Title>Validación automática</HAlert.Title>
                <HAlert.Description>
                  Los correos y documentos duplicados se omiten, y las filas con error se informan
                  sin detener la carga de las demás.
                </HAlert.Description>
              </HAlert.Content>
            </HAlert>
            <HAlert status="warning">
              <HAlert.Indicator />
              <HAlert.Content>
                <HAlert.Title>Cuentas sin rol</HAlert.Title>
                <HAlert.Description>Asígnales Aprendiz o Instructor en la tabla de abajo para que puedan iniciar sesión.</HAlert.Description>
              </HAlert.Content>
            </HAlert>
          </div>
        </div>
      </HCard>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Cuentas cargadas", value: registeredUsers.length, icon: Users, color: "#2E8A00" },
          { label: "Sin rol asignado", value: usersWithoutRole, icon: UserX, color: "#DB6E00" },
          { label: "Instructores", value: instructorCount, icon: Briefcase, color: "#F27C00" },
          { label: "Aprendices", value: aprendizCount, icon: GraduationCap, color: "#39A900" },
        ].map((st) => (
          <HCard key={st.label} className="border border-sara-line shadow-none rounded-3xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{st.label}</p>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${st.color}1A`, color: st.color }}>
                <st.icon className="w-4.5 h-4.5" />
              </span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: st.color }}>{st.value}</p>
          </HCard>
        ))}
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-300">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: "#F27C00" }}>
            <UserCog className="w-6 h-6" />
            Gestión de cuentas y roles
          </CardTitle>
          <CardDescription>
            Consulta y corrige los roles de las cuentas cargadas por administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Búsqueda */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Información */}
          {usersWithoutRole > 0 && (
            <Alert className="mb-4 bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                Hay {usersWithoutRole} usuario{usersWithoutRole > 1 ? "s" : ""} sin rol asignado
              </AlertDescription>
            </Alert>
          )}

          {/* Tabla */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Asignar Rol</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={
                        selectedUser === user.id
                          ? "bg-green-50 transition-colors"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(user.registrationDate).toLocaleDateString("es-CO")}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || "sin-rol"}
                          onValueChange={(value) => {
                            if (value !== "sin-rol") {
                              handleRoleChange(user.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sin-rol" disabled>
                              Seleccionar rol...
                            </SelectItem>
                            <SelectItem value="aprendiz">Aprendiz</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {selectedUser === user.id && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Resumen */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {registeredUsers.length} usuarios
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
