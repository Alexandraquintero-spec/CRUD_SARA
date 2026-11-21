import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Lightbulb,
  Send,
  MessageCircle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { suggestionsStore, Suggestion } from "../../store/suggestionsStore";

interface SuggestionsViewProps {
  userId: string;
  userName: string;
  userRole: "aprendiz" | "instructor";
}

const CATEGORIES = [
  { value: "menu", label: "Menú y alimentación" },
  { value: "servicio", label: "Servicio" },
  { value: "instalaciones", label: "Instalaciones" },
  { value: "horario", label: "Horarios" },
  { value: "otro", label: "Otro" },
];

const STATUS_CONFIG = {
  nueva: { label: "Nueva", bg: "bg-sara-green-50", text: "text-sara-green-dark", border: "border-sara-green-100", icon: <Clock className="w-3.5 h-3.5" /> },
  revisada: { label: "Revisada", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: <Star className="w-3.5 h-3.5" /> },
  implementada: { label: "Implementada", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

export default function SuggestionsView({ userId, userName, userRole }: SuggestionsViewProps) {
  const [mySuggestions, setMySuggestions] = useState<Suggestion[]>(
    () => suggestionsStore.getByAuthor(userId)
  );
  const [form, setForm] = useState({ category: "menu" as Suggestion["category"], title: "", description: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Por favor completa título y descripción");
      return;
    }
    setSending(true);
    setTimeout(() => {
      const suggestion: Suggestion = {
        id: `sug-${Date.now()}`,
        authorId: userId,
        authorName: userName,
        authorRole: userRole,
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date().toISOString().split("T")[0],
        status: "nueva",
      };
      suggestionsStore.add(suggestion);
      setMySuggestions(suggestionsStore.getByAuthor(userId));
      setForm({ category: "menu", title: "", description: "" });
      setSending(false);
      toast.success("¡Observación enviada!", {
        description: "El administrador la revisará pronto.",
      });
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header info */}
      <Card className="border-0 shadow-sm" style={{ borderLeftColor: "#39A900" }}>
        <CardContent className="pt-4 pb-4 flex gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#39A900" }}>
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Buzón de observaciones</p>
            <p className="text-sm text-gray-500">Tus observaciones ayudan a mejorar el restaurante SARA. El administrador responde cada observación.</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: "#39A900" }}>
            <Send className="w-4 h-4" />
            Enviar una observación
          </CardTitle>
          <CardDescription>Comparte tu observación o comentario. Todos los aportes son bienvenidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Suggestion["category"] })}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Título de la observación</Label>
              <Input
                placeholder="Ej: Mejorar variedad de fruta en el menú"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Descripción detallada</Label>
              <Textarea
                placeholder="Cuéntanos con más detalle tu idea, por qué sería útil y cómo implementarla..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="rounded-xl resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full h-11 text-white rounded-xl font-semibold shadow-md"
              style={{ backgroundColor: "#39A900" }}
            >
              {sending ? (
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Enviando...</span>
              ) : (
                <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Enviar observación</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mis sugerencias */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Mis Observaciones ({mySuggestions.length})
        </h3>
        {mySuggestions.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-10 text-center text-gray-400">
              <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aún no has enviado observaciones</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((s) => {
              const cfg = STATUS_CONFIG[s.status];
              const cat = CATEGORIES.find((c) => c.value === s.category);
              return (
                <Card key={s.id} className="bg-white">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cat?.label} · {new Date(s.date).toLocaleDateString("es-CO")}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.text} ${cfg.bg} border ${cfg.border} flex-shrink-0`}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{s.description}</p>
                    {s.adminResponse && (
                      <div className="bg-white border border-green-200 rounded-lg p-3 flex gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-0.5">Respuesta del Administrador</p>
                          <p className="text-xs text-gray-700">{s.adminResponse}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
