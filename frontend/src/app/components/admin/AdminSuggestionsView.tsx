import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Lightbulb,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  Briefcase,
  MessageCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { suggestionsStore, Suggestion } from "../../store/suggestionsStore";

const CATEGORIES: Record<string, string> = {
  menu: "Menú",
  servicio: "Servicio",
  instalaciones: "Instalaciones",
  horario: "Horarios",
  otro: "Otro",
};

const STATUS_CONFIG = {
  nueva: { label: "Nueva", color: "#39A900", bg: "bg-sara-green-50", border: "border-sara-green-100" },
  revisada: { label: "Revisada", color: "#f59e0b", bg: "bg-yellow-50", border: "border-yellow-200" },
  implementada: { label: "Implementada", color: "#39A900", bg: "bg-green-50", border: "border-green-200" },
};

const ROLE_ICONS = {
  aprendiz: <BookOpen className="w-3.5 h-3.5" />,
  instructor: <Briefcase className="w-3.5 h-3.5" />,
};

const ROLE_COLORS = {
  aprendiz: { bg: "bg-green-100", text: "text-green-700" },
  instructor: { bg: "bg-orange-100", text: "text-orange-700" },
};

export default function AdminSuggestionsView() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(suggestionsStore.getAll());
  const [filterStatus, setFilterStatus] = useState<"todas" | Suggestion["status"]>("todas");
  const [filterRole, setFilterRole] = useState<"todos" | Suggestion["authorRole"]>("todos");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const refresh = () => setSuggestions(suggestionsStore.getAll());

  const handleStatus = (id: string, status: Suggestion["status"]) => {
    suggestionsStore.updateStatus(id, status);
    refresh();
    toast.success(`Estado actualizado a "${STATUS_CONFIG[status].label}"`);
  };

  const handleRespond = (id: string) => {
    if (!responseText.trim()) { toast.error("Escribe una respuesta primero"); return; }
    suggestionsStore.updateStatus(id, "revisada", responseText.trim());
    refresh();
    setRespondingId(null);
    setResponseText("");
    toast.success("Respuesta enviada al usuario");
  };

  const filtered = suggestions.filter((s) => {
    const matchStatus = filterStatus === "todas" || s.status === filterStatus;
    const matchRole = filterRole === "todos" || s.authorRole === filterRole;
    return matchStatus && matchRole;
  });

  const counts = {
    nueva: suggestions.filter((s) => s.status === "nueva").length,
    revisada: suggestions.filter((s) => s.status === "revisada").length,
    implementada: suggestions.filter((s) => s.status === "implementada").length,
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-sara-orange" />
              <p className="text-xs text-gray-500">Total Observaciones</p>
            </div>
            <p className="text-3xl font-extrabold text-sara-orange-dark">{suggestions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-sara-green" />
              <p className="text-xs text-gray-500">Nuevas</p>
            </div>
            <p className="text-3xl font-extrabold text-sara-green-dark">{counts.nueva}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-gray-500">Revisadas</p>
            </div>
            <p className="text-3xl font-extrabold text-yellow-600">{counts.revisada}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Implementadas</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#39A900" }}>{counts.implementada}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">Estado:</span>
              {(["todas", "nueva", "revisada", "implementada"] as const).map((f) => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize"
                  style={{
                    backgroundColor: filterStatus === f ? "#39A900" : "#f3f4f6",
                    color: filterStatus === f ? "white" : "#6b7280",
                  }}>
                  {f === "todas" ? "Todas" : STATUS_CONFIG[f].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Rol:</span>
              {(["todos", "aprendiz", "instructor"] as const).map((r) => (
                <button key={r} onClick={() => setFilterRole(r)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize"
                  style={{
                    backgroundColor: filterRole === r ? "#F27C00" : "#f3f4f6",
                    color: filterRole === r ? "white" : "#6b7280",
                  }}>
                  {r === "todos" ? "Todos" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-gray-400">
            <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay observaciones con los filtros seleccionados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const cfg = STATUS_CONFIG[s.status];
            const roleStyle = ROLE_COLORS[s.authorRole];
            return (
              <Card key={s.id} className="bg-white hover: transition-shadow">
                <CardContent className="pt-4 pb-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                          {ROLE_ICONS[s.authorRole]}
                          {s.authorRole.charAt(0).toUpperCase() + s.authorRole.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">{s.authorName}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString("es-CO")}</span>
                      </div>
                      <p className="font-semibold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{CATEGORIES[s.category]}</p>
                    </div>
                    <Badge
                      className="text-xs flex-shrink-0"
                      style={{ backgroundColor: cfg.color, color: "white" }}
                    >
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{s.description}</p>

                  {/* Respuesta existente */}
                  {s.adminResponse && (
                    <div className="flex gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-0.5">Tu respuesta</p>
                        <p className="text-xs text-gray-700">{s.adminResponse}</p>
                      </div>
                    </div>
                  )}

                  {/* Responder */}
                  {respondingId === s.id && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Escribe tu respuesta al usuario..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                        className="rounded-xl resize-none text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="text-white text-xs" style={{ backgroundColor: "#39A900" }} onClick={() => handleRespond(s.id)}>
                          <MessageCircle className="w-3.5 h-3.5 mr-1" /> Enviar respuesta
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => { setRespondingId(null); setResponseText(""); }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                    {respondingId !== s.id && (
                      <Button size="sm" variant="outline" className="text-xs h-7"
                        onClick={() => { setRespondingId(s.id); setResponseText(s.adminResponse || ""); }}>
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        {s.adminResponse ? "Editar respuesta" : "Responder"}
                      </Button>
                    )}
                    {s.status !== "revisada" && (
                      <Button size="sm" variant="outline" className="text-xs h-7 text-yellow-700 border-yellow-300"
                        onClick={() => handleStatus(s.id, "revisada")}>
                        <Star className="w-3.5 h-3.5 mr-1" /> Marcar revisada
                      </Button>
                    )}
                    {s.status !== "implementada" && (
                      <Button size="sm" className="text-xs h-7 text-white"
                        style={{ backgroundColor: "#39A900" }}
                        onClick={() => handleStatus(s.id, "implementada")}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Marcar implementada
                      </Button>
                    )}
                    {s.status !== "nueva" && (
                      <Button size="sm" variant="outline" className="text-xs h-7 text-sara-green-dark border-sara-green-100"
                        onClick={() => handleStatus(s.id, "nueva")}>
                        <Clock className="w-3.5 h-3.5 mr-1" /> Restablecer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
