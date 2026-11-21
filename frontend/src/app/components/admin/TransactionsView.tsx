import { useState } from "react";
import { useGlobalData } from "../../GlobalDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
import { Receipt, Search, UtensilsCrossed, ShoppingBag, TrendingUp } from "lucide-react";

export default function TransactionsView() {
  const { transactions, registeredUsers } = useGlobalData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"todas" | "almuerzo" | "tienda">("todas");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "todas" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalTransactions = transactions.length;
  const totalAlmuerzos = transactions.filter((t) => t.type === "almuerzo").length;
  const totalTienda = transactions.filter((t) => t.type === "tienda").length;

  const totalIngresos = transactions.reduce((sum, t) => sum + t.amount, 0);
  const ingresosAlmuerzos = transactions
    .filter((t) => t.type === "almuerzo")
    .reduce((sum, t) => sum + t.amount, 0);
  const ingresosTienda = transactions
    .filter((t) => t.type === "tienda")
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completado: "bg-green-100 text-green-700 border-green-300",
      pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
      cancelado: "bg-red-100 text-red-700 border-red-300",
    };

    const statusLabels = {
      completado: "Completado",
      pendiente: "Pendiente",
      cancelado: "Cancelado",
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === "almuerzo" ? (
      <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
        <UtensilsCrossed className="w-3 h-3" />
        Almuerzo
      </Badge>
    ) : (
      <Badge className="bg-sara-green-100 text-sara-green-dark border-sara-green-100 gap-1">
        <ShoppingBag className="w-3 h-3" />
        Tienda
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ingresos totales</CardDescription>
            <CardTitle className="text-3xl" style={{ color: "#F27C00" }}>
              ${totalIngresos.toLocaleString("es-CO")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Transacciones</CardDescription>
            <CardTitle className="text-3xl">{totalTransactions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Almuerzos</CardDescription>
            <CardTitle className="text-2xl text-green-700">
              {totalAlmuerzos}
              <span className="text-sm ml-2 font-normal">
                (${ingresosAlmuerzos.toLocaleString("es-CO")})
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tienda</CardDescription>
            <CardTitle className="text-2xl text-sara-green-dark">
              {totalTienda}
              <span className="text-sm ml-2 font-normal">
                (${ingresosTienda.toLocaleString("es-CO")})
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabla de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: "#F27C00" }}>
            <Receipt className="w-6 h-6" />
            Registro de Transacciones
          </CardTitle>
          <CardDescription>
            Historial completo de compras de almuerzos y productos de la tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario o detalles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value: any) => setFilterType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="almuerzo">Almuerzos</SelectItem>
                <SelectItem value="tienda">Tienda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron transacciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        <div>{new Date(transaction.date).toLocaleDateString("es-CO")}</div>
                        <div className="text-xs text-gray-500">{transaction.time}</div>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.userName}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 capitalize">
                          {transaction.userRole}
                        </span>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-gray-600 truncate" title={transaction.details}>
                          {transaction.details}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: "#39A900" }}>
                        ${transaction.amount.toLocaleString("es-CO")}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Resumen */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Mostrando {filteredTransactions.length} de {totalTransactions} transacciones
            </div>
            <div className="font-semibold">
              Total mostrado: ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString("es-CO")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
