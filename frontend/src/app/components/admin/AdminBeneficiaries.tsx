import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { useGlobalData } from "../../GlobalDataContext";
import { DocumentType } from "../../types";
import { GraduationCap, UserPlus, Search, HeartHandshake } from "lucide-react";
import { toast } from "sonner";

export default function AdminBeneficiaries() {
  const { registeredUsers, addUser, setBeneficiary } = useGlobalData();
  const [name, setName] = useState("");
  const [docType, setDocType] = useState<DocumentType>("TI");
  const [doc, setDoc] = useState("");
  const [ficha, setFicha] = useState("");
  const [isBeneficiary, setIsBeneficiary] = useState(false);
  const [search, setSearch] = useState("");

  const apprentices = registeredUsers.filter((u) => u.role === "aprendiz");
  const beneficiaries = apprentices.filter((u) => u.beneficiary).length;
  const filtered = apprentices.filter((u) =>
    [u.name, u.documentNumber, u.ficha].some((v) =>
      (v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !doc.trim() || !ficha.trim()) {
      toast.error("Completa nombre, documento e ID de ficha");
      return;
    }
    const existing = apprentices.find((u) => u.documentNumber === doc.trim());
    if (existing) {
      setBeneficiary(existing.id, isBeneficiary);
      toast.success("Aprendiz actualizado", {
        description: `${existing.name}: ${isBeneficiary ? "beneficiario" : "normal"}`,
      });
    } else {
      addUser({
        id: `apr-${Date.now()}`,
        name: name.trim(),
        role: "aprendiz",
        ficha: ficha.trim(),
        documentType: docType,
        documentNumber: doc.trim(),
        beneficiary: isBeneficiary,
        registrationDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Aprendiz registrado", {
        description: `${name.trim()} · ${isBeneficiary ? "Beneficiario" : "Normal"}`,
      });
    }
    setName("");
    setDoc("");
    setFicha("");
    setIsBeneficiary(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Aprendices</p>
            <p className="text-3xl font-extrabold text-gray-800">{apprentices.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Beneficiarios ($0)</p>
            <p className="text-3xl font-extrabold" style={{ color: "#39A900" }}>{beneficiaries}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Normales ($5.000)</p>
            <p className="text-3xl font-extrabold" style={{ color: "#F27C00" }}>
              {apprentices.length - beneficiaries}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#39A900" }}>
              <UserPlus className="w-5 h-5" /> Registrar aprendiz
            </CardTitle>
            <CardDescription>
              Define si el aprendiz es normal o beneficiario. Si el documento ya existe, se actualiza.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-name" className="text-sm">Nombre completo</Label>
                <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Valentina Torres Ríos" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Tipo y número de documento</Label>
                <div className="flex gap-2">
                  <div className="flex rounded-xl overflow-hidden border border-gray-300">
                    {(["CC", "TI"] as DocumentType[]).map((t) => (
                      <button key={t} type="button" onClick={() => setDocType(t)}
                        className="px-3 text-xs font-semibold"
                        style={{
                          backgroundColor: docType === t ? "#39A900" : "transparent",
                          color: docType === t ? "white" : "#6b7280",
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <Input value={doc} onChange={(e) => setDoc(e.target.value)}
                    placeholder="Número" className="h-11 rounded-xl flex-1" />
                </div>
                <p className="text-xs text-gray-400">CC: Cédula · TI: Tarjeta de identidad</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-ficha" className="text-sm">ID de ficha</Label>
                <Input id="b-ficha" value={ficha} onChange={(e) => setFicha(e.target.value)}
                  placeholder="Ej: 2891234" className="h-11 rounded-xl" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">¿Es beneficiario?</p>
                  <p className="text-xs text-gray-500">
                    {isBeneficiary ? "Almuerzo sin costo ($0)" : "Paga $5.000 por almuerzo"}
                  </p>
                </div>
                <Switch checked={isBeneficiary} onCheckedChange={setIsBeneficiary} />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl text-white" style={{ backgroundColor: "#39A900" }}>
                Guardar aprendiz
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <GraduationCap className="w-5 h-5" /> Aprendices registrados
            </CardTitle>
            <div className="relative pt-2">
              <Search className="absolute left-3 top-1/2 translate-y-0 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, documento o ficha" className="pl-10 h-10 rounded-xl" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-center text-gray-400 py-8">Sin resultados</p>
            )}
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500">
                    {u.documentType ? `${u.documentType} ${u.documentNumber}` : "Documento sin registrar"} · Ficha {u.ficha || "—"}
                  </p>
                </div>
                <Badge className={u.beneficiary ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                  {u.beneficiary ? <><HeartHandshake className="w-3 h-3 mr-1" />Beneficiario</> : "Normal"}
                </Badge>
                <Switch checked={!!u.beneficiary} onCheckedChange={(v) => setBeneficiary(u.id, v)} aria-label="Beneficiario" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
