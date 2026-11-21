import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useGlobalData } from "../../GlobalDataContext";
import { DocumentType } from "../../types";
import { priceStore } from "../../store/priceStore";
import {
  Users,
  Receipt,
  UtensilsCrossed,
  Clock,
  UserPlus,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminVisitorPurchase() {
  const { transactions, visitors, addVisitor, addTransaction } = useGlobalData();
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentNumber, setDocumentNumber] = useState("");

  const history = transactions.filter((transaction) => transaction.userRole === "visitante");
  const revenue = history.reduce((sum, transaction) => sum + transaction.amount, 0);
  const reservationsOf = (id: string) =>
    history.filter((transaction) => transaction.userId === id).length;

  const registerVisitor = (
    visitorName: string,
    type: DocumentType,
    document: string
  ) => {
    const now = new Date();
    const id = `visitor-${document}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    addVisitor({
      id,
      name: visitorName,
      documentType: type,
      documentNumber: document,
      enteredAt: now.toISOString(),
    });
    addTransaction({
      type: "almuerzo",
      userId: id,
      userName: visitorName,
      userRole: "visitante",
      amount: priceStore.getVisitorPrice(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      details: "Almuerzo de visitante registrado por administración",
      status: "completado",
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !documentNumber.trim()) {
      toast.error("Completa el nombre y el documento");
      return;
    }
    registerVisitor(name.trim(), documentType, documentNumber.trim());
    toast.success("Visitante y almuerzo registrados", {
      description: `${name.trim()} · $${priceStore.getVisitorPrice().toLocaleString("es-CO")}`,
    });
    setName("");
    setDocumentNumber("");
  };

  const downloadTemplate = () => {
    const csv = [
      "nombre,tipo_documento,numero_documento",
      "María Gómez,CC,1098765432",
      "Juan Pérez,TI,1012345678",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plantilla_visitantes_sara.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Carga un archivo CSV");
      return;
    }
    const rows = (await file.text()).split(/\r?\n/).filter(Boolean).slice(1);
    let imported = 0;
    rows.forEach((row) => {
      const [visitorName, rawType, document] = row.split(",").map((cell) => cell.trim());
      const type = rawType?.toUpperCase();
      if (visitorName && document && (type === "CC" || type === "TI")) {
        registerVisitor(visitorName, type, document);
        imported += 1;
      }
    });
    if (imported === 0) {
      toast.error("No se encontraron filas válidas");
      return;
    }
    toast.success(`${imported} visitantes importados`, {
      description: "Sus almuerzos quedaron registrados en el historial.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: Users,
            label: "Visitantes registrados",
            value: visitors.length,
            color: "#F27C00",
          },
          {
            icon: UtensilsCrossed,
            label: "Almuerzos de visitantes",
            value: history.length,
            color: "#39A900",
          },
          {
            icon: Receipt,
            label: "Ingresos por visitantes",
            value: `$${revenue.toLocaleString("es-CO")}`,
            color: "#00543A",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: "#F27C00" }}>
                <UserPlus className="w-5 h-5" />
                Registrar visitante
              </CardTitle>
              <CardDescription>
                El administrador registra al visitante y su almuerzo individualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="visitor-name">Nombre completo</Label>
                  <Input
                    id="visitor-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: María Gómez"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo y número de documento</Label>
                  <div className="flex gap-2">
                    <div className="flex overflow-hidden rounded-xl border">
                      {(["CC", "TI"] as DocumentType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDocumentType(type)}
                          className="px-3 text-xs font-semibold"
                          style={{
                            backgroundColor: documentType === type ? "#F27C00" : "white",
                            color: documentType === type ? "white" : "#6b7280",
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={documentNumber}
                      onChange={(event) => setDocumentNumber(event.target.value)}
                      placeholder="Número"
                      className="h-11 flex-1 rounded-xl"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm">
                  Precio vigente:{" "}
                  <strong>${priceStore.getVisitorPrice().toLocaleString("es-CO")}</strong>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-white"
                  style={{ backgroundColor: "#F27C00" }}
                >
                  Registrar visitante y almuerzo
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Upload className="w-5 h-5" />
                Carga masiva
              </CardTitle>
              <CardDescription>
                Importa varios visitantes desde un archivo CSV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00543A] px-4 text-sm font-semibold text-white">
                <Upload className="w-4 h-4" />
                Cargar CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => handleBulkUpload(event.target.files?.[0])}
                />
              </label>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Descargar plantilla
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5" />
                Visitantes
              </CardTitle>
              <CardDescription>Rol informativo y cantidad de almuerzos registrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {visitors.length === 0 && (
                <p className="text-sm text-center text-gray-400 py-8">
                  Aún no hay visitantes registrados
                </p>
              )}
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-gray-50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{visitor.name}</p>
                    <p className="text-xs text-gray-500">
                      {visitor.documentType} {visitor.documentNumber}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(visitor.enteredAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-orange-100 text-orange-700">Visitante</Badge>
                    <p className="mt-1 text-xs font-semibold text-gray-700">
                      {reservationsOf(visitor.id)} almuerzo
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Receipt className="w-5 h-5" />
                Historial de almuerzos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {history.length === 0 && (
                <p className="text-sm text-center text-gray-400 py-8">
                  Sin almuerzos registrados
                </p>
              )}
              {history.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{transaction.userName}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.date} · {transaction.time}
                    </p>
                  </div>
                  <p className="font-bold text-green-700">
                    ${transaction.amount.toLocaleString("es-CO")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
