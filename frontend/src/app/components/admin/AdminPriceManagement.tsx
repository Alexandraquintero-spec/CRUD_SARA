import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DollarSign, UtensilsCrossed, Info, Users, Pencil, Check, X } from "lucide-react";
import { priceStore } from "../../store/priceStore";
import { toast } from "sonner";

interface PriceCardProps {
  title: string;
  description: string;
  label: string;
  hint: string;
  color: string;
  tint: string;
  icon: React.ReactNode;
  value: number;
  onSave: (value: number) => void;
}

function PriceCard({ title, description, label, hint, color, tint, icon, value, onSave }: PriceCardProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(value));

  const save = () => {
    const parsed = Number(input.replace(/\D/g, ""));
    if (!parsed || parsed < 1000) {
      toast.error("El precio mínimo es $1.000");
      return;
    }
    onSave(parsed);
    setEditing(false);
    toast.success(`${title} actualizado`, {
      description: `Nuevo precio: $${parsed.toLocaleString("es-CO")}`,
    });
  };

  const cancel = () => {
    setInput(String(value));
    setEditing(false);
  };

  return (
    <Card className="border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base" style={{ color }}>
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-wrap items-center gap-4 rounded-2xl border p-4"
          style={{ backgroundColor: tint, borderColor: `${color}40` }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">{hint}</p>
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-10 w-28 rounded-xl pl-7 text-right"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                    if (e.key === "Escape") cancel();
                  }}
                />
              </div>
              <Button size="sm" className="h-10 w-10 p-0 text-white" style={{ backgroundColor: "#39A900" }} onClick={save}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-10 w-10 p-0" onClick={cancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-2xl font-extrabold" style={{ color }}>
                ${value.toLocaleString("es-CO")}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setInput(String(value));
                  setEditing(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Editar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPriceManagement() {
  const [lunchPrice, setLunchPrice] = useState(priceStore.getLunchPrice());
  const [visitorPrice, setVisitorPrice] = useState(priceStore.getVisitorPrice());

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-0 shadow-sm" style={{ borderLeftColor: "#F27C00" }}>
        <CardContent className="pt-4 pb-4 flex gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#F27C00" }} />
          <p className="text-sm text-gray-700">
            Los cambios se aplican de inmediato a las nuevas reservas. Las reservas ya hechas
            conservan su valor y los beneficiarios siguen pagando $0.
          </p>
        </CardContent>
      </Card>

      <PriceCard
        title="Precio Aprendices SENA"
        description="Tarifa del almuerzo para aprendices (normales) e instructores"
        label="Almuerzo completo"
        hint="Reservas: 7:00 a. m. – 9:00 a. m. · Servicio: 12:00 m. a 1:30 p. m."
        color="#39A900"
        tint="#f0fce8"
        icon={<UtensilsCrossed className="w-5 h-5" />}
        value={lunchPrice}
        onSave={(v) => {
          priceStore.setLunchPrice(v);
          setLunchPrice(v);
        }}
      />

      <PriceCard
        title="Precio Visitantes"
        description="Se aplica a los visitantes registrados por el administrador"
        label="Almuerzo de visitante"
        hint="Tarifa modificable por administración"
        color="#F27C00"
        tint="#fff4ec"
        icon={<Users className="w-5 h-5" />}
        value={visitorPrice}
        onSave={(v) => {
          priceStore.setVisitorPrice(v);
          setVisitorPrice(v);
        }}
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-600">Precios vigentes</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Aprendiz / Instructor", v: `$${lunchPrice.toLocaleString("es-CO")}`, c: "#39A900" },
              { l: "Visitante", v: `$${visitorPrice.toLocaleString("es-CO")}`, c: "#F27C00" },
              { l: "Beneficiario", v: "$0", c: "#00543A" },
            ].map((p) => (
              <div key={p.l} className="rounded-xl bg-white p-4 text-center shadow-sm">
                <p className="text-xs text-gray-400 mb-1">{p.l}</p>
                <p className="text-2xl font-extrabold" style={{ color: p.c }}>{p.v}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
