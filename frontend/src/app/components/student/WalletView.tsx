import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Wallet, CreditCard, Building2, Plus, History } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface WalletViewProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

interface Transaction {
  id: string;
  fecha: string;
  tipo: "recarga" | "compra";
  monto: number;
  metodo?: string;
  descripcion: string;
}

export default function WalletView({ balance, onBalanceUpdate }: WalletViewProps) {
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"pse" | null>(null);
  const [showPSEForm, setShowPSEForm] = useState(false);
  
  // PSE Form States
  const [selectedBank, setSelectedBank] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      fecha: "2024-12-17 09:30",
      tipo: "recarga",
      monto: 50000,
      metodo: "PSE",
      descripcion: "Recarga inicial"
    },
    {
      id: "2",
      fecha: "2024-12-17 12:15",
      tipo: "compra",
      monto: -5000,
      descripcion: "Compra almuerzo"
    }
  ]);

  const quickAmounts = [10000, 20000, 50000, 100000];

  const handleQuickRecharge = (amount: number) => {
    setRechargeAmount(amount.toString());
  };

  const handleRecharge = () => {
    const amount = parseInt(rechargeAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (amount < 5000) {
      toast.error("El monto mínimo de recarga es $5.000");
      return;
    }

    if (!selectedMethod) {
      toast.error("Selecciona un método de pago");
      return;
    }

    // Simular proceso de pago PSE
    setShowPSEForm(true);
  };

  const handlePSEPayment = () => {
    // Validar datos del formulario
    if (!selectedBank || !accountType || !accountNumber || !documentType || !documentNumber) {
      toast.error("Por favor completa todos los campos del formulario");
      return;
    }

    const amount = parseInt(rechargeAmount);
    const newBalance = balance + amount;
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleString("es-CO"),
      tipo: "recarga",
      monto: amount,
      metodo: `PSE - ${selectedBank}`,
      descripcion: `Recarga por PSE desde ${selectedBank}`
    };

    setTransactions([newTransaction, ...transactions]);
    onBalanceUpdate(newBalance);
    setRechargeAmount("");
    setSelectedMethod(null);
    setShowPSEForm(false);
    
    // Limpiar datos del formulario
    setSelectedBank("");
    setAccountType("");
    setAccountNumber("");
    setDocumentType("");
    setDocumentNumber("");
    
    toast.success(`Recarga exitosa de $${amount.toLocaleString("es-CO")}`, {
      description: `Tu saldo ha sido actualizado desde ${selectedBank}`
    });
  };

  const colombianBanks = [
    "Bancolombia",
    "Banco de Bogotá",
    "Davivienda",
    "BBVA Colombia",
    "Banco Popular",
    "Banco Occidente",
    "Banco Caja Social",
    "Banco AV Villas",
    "Banco Agrario",
    "Colpatria",
    "Banco Pichincha",
    "Banco Falabella",
    "Banco Cooperativo Coopcentral",
    "Bancamía",
    "Nequi",
    "Daviplata"
  ];

  return (
    <div className="space-y-6">
      {/* Saldo actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#39A900' }}>
            <Wallet className="w-6 h-6" />
            Tu Cartera Digital
          </CardTitle>
          <CardDescription>Saldo disponible para compras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-2">Saldo Disponible</p>
            <p className="text-5xl mb-4" style={{ color: '#39A900' }}>
              ${balance.toLocaleString("es-CO")}
            </p>
            <Badge className="text-lg py-2 px-4" style={{ backgroundColor: '#39A900' }}>
              COP - Pesos Colombianos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recargar cartera */}
      {!showPSEForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" style={{ color: '#F27C00' }} />
              Recargar Cartera
            </CardTitle>
            <CardDescription>
              Agrega saldo para comprar tus almuerzos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Montos rápidos */}
            <div className="space-y-2">
              <Label>Montos Rápidos</Label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => handleQuickRecharge(amount)}
                    className="hover:border-green-600"
                  >
                    ${(amount / 1000)}K
                  </Button>
                ))}
              </div>
            </div>

            {/* Monto personalizado */}
            <div className="space-y-2">
              <Label htmlFor="amount">Monto Personalizado</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ej: 30000"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500">Monto mínimo: $5.000 COP</p>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <div className="grid gap-3">
                <button
                  onClick={() => setSelectedMethod("pse")}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === "pse"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <Building2 className="w-6 h-6" style={{ color: '#39A900' }} />
                  <div className="text-left flex-1">
                    <p>PSE - Pago Seguro en Línea</p>
                    <p className="text-sm text-gray-600">Paga directamente desde tu banco</p>
                  </div>
                  {selectedMethod === "pse" && (
                    <Badge style={{ backgroundColor: '#39A900' }}>Seleccionado</Badge>
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleRecharge}
              className="w-full"
              style={{ backgroundColor: '#39A900' }}
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Continuar con el Pago
            </Button>

            <div className="bg-sara-green-50 border border-sara-green-100 rounded-lg p-4">
              <p className="text-sm">
                <strong>Nota:</strong> El saldo de tu cartera solo puede usarse para comprar almuerzos en el restaurante SARA
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#39A900' }}>Pago con PSE</CardTitle>
            <CardDescription>
              Completa los datos de tu banco para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Monto a Recargar</p>
                <p className="text-3xl" style={{ color: '#39A900' }}>
                  ${parseInt(rechargeAmount).toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            {/* Formulario de datos bancarios */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Selecciona tu Banco</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger id="bank">
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {colombianBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Selecciona tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número de Documento</Label>
                <Input
                  id="documentNumber"
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Cuenta</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Selecciona tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahorros">Cuenta de Ahorros</SelectItem>
                    <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Número de Cuenta</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Ej: 12345678901234"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-sara-green-50 border border-sara-green-100 rounded-lg p-3">
              <p className="text-sm">
                <strong>Modo Demo:</strong> Simularemos el pago exitoso. En producción, se integraría con el servicio PSE real.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePSEPayment}
                className="flex-1"
                style={{ backgroundColor: '#39A900' }}
              >
                <Building2 className="w-5 h-5 mr-2" />
                Confirmar Pago
              </Button>
              <Button
                onClick={() => {
                  setShowPSEForm(false);
                  setSelectedBank("");
                  setAccountType("");
                  setAccountNumber("");
                  setDocumentType("");
                  setDocumentNumber("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Movimientos
          </CardTitle>
          <CardDescription>Últimas transacciones de tu cartera</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {transaction.tipo === "recarga" ? (
                    <div className="bg-green-100 p-2 rounded-full">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-orange-100 p-2 rounded-full">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm">{transaction.descripcion}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.fecha}
                      {transaction.metodo && ` • ${transaction.metodo}`}
                    </p>
                  </div>
                </div>
                <div className={transaction.tipo === "recarga" ? "text-green-600" : "text-red-600"}>
                  <p>
                    {transaction.tipo === "recarga" ? "+" : ""}${Math.abs(transaction.monto).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay transacciones registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}