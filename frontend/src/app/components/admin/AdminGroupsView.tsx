import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Users,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  UtensilsCrossed,
  UserCheck,
  UserX,
  Star,
  TrendingUp,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

type ProgramType = "Tecnólogo" | "Técnico";

interface Apprentice {
  id: string;
  name: string;
  eatsHere: boolean;
}

interface Group {
  id: string;
  ficha: string;
  programType: ProgramType;
  programName: string;
  instructorName: string;
  vocero: string;
  totalAprendices: number;
  presentAprendices: number; // cuántos comen aquí (editable)
  promedioConsumo: number;
  apprentices: Apprentice[];
}

const INITIAL_GROUPS: Group[] = [
  {
    id: "g1",
    ficha: "2891234",
    programType: "Tecnólogo",
    programName: "Tecnología en Gastronomía",
    instructorName: "Carlos Andrés Martínez",
    vocero: "Valentina Torres Ríos",
    totalAprendices: 28,
    presentAprendices: 23,
    promedioConsumo: 82,
    apprentices: [
      { id: "a1", name: "Valentina Torres Ríos", eatsHere: true },
      { id: "a2", name: "Sebastián Gómez Herrera", eatsHere: true },
      { id: "a3", name: "Camila Vargas López", eatsHere: true },
      { id: "a4", name: "Andrés Murillo Parra", eatsHere: false },
      { id: "a5", name: "Laura Buitrago Soto", eatsHere: true },
      { id: "a6", name: "Felipe Arango Cano", eatsHere: true },
      { id: "a7", name: "Mariana Pérez Castro", eatsHere: false },
      { id: "a8", name: "Juan Rodríguez Vera", eatsHere: true },
    ],
  },
  {
    id: "g2",
    ficha: "2891250",
    programType: "Técnico",
    programName: "Técnico en Cocina",
    instructorName: "Laura Sofía Jiménez",
    vocero: "Nicolás Herrera Mora",
    totalAprendices: 22,
    presentAprendices: 15,
    promedioConsumo: 68,
    apprentices: [
      { id: "b1", name: "Nicolás Herrera Mora", eatsHere: true },
      { id: "b2", name: "Sara Quintero Díaz", eatsHere: true },
      { id: "b3", name: "Miguel Ángel Ríos", eatsHere: false },
      { id: "b4", name: "Isabella Sánchez Cano", eatsHere: true },
      { id: "b5", name: "Tomás Ramírez Duque", eatsHere: false },
      { id: "b6", name: "Alejandra Moreno Ruiz", eatsHere: true },
    ],
  },
  {
    id: "g3",
    ficha: "2891267",
    programType: "Tecnólogo",
    programName: "Tecnología en Panadería y Repostería",
    instructorName: "Jorge Iván Sánchez",
    vocero: "Daniela Ospina Zuluaga",
    totalAprendices: 25,
    presentAprendices: 18,
    promedioConsumo: 74,
    apprentices: [
      { id: "c1", name: "Daniela Ospina Zuluaga", eatsHere: true },
      { id: "c2", name: "Carlos Mejía Palacio", eatsHere: true },
      { id: "c3", name: "Andrea Montoya Vélez", eatsHere: true },
      { id: "c4", name: "Julián Cardona Ocampo", eatsHere: false },
      { id: "c5", name: "Gabriela Restrepo Arenas", eatsHere: true },
      { id: "c6", name: "Samuel Gutiérrez Toro", eatsHere: true },
    ],
  },
  {
    id: "g4",
    ficha: "2891289",
    programType: "Técnico",
    programName: "Técnico en Panadería y Repostería",
    instructorName: "Paola Andrea Torres",
    vocero: "Sofía Castro Bermúdez",
    totalAprendices: 18,
    presentAprendices: 10,
    promedioConsumo: 56,
    apprentices: [
      { id: "d1", name: "Sofía Castro Bermúdez", eatsHere: true },
      { id: "d2", name: "Emilio Vargas Naranjo", eatsHere: false },
      { id: "d3", name: "Paula Henao Sierra", eatsHere: false },
      { id: "d4", name: "Rodrigo Echeverri López", eatsHere: true },
      { id: "d5", name: "Cristina Salazar Muñoz", eatsHere: true },
      { id: "d6", name: "Eduardo Mesa Cano", eatsHere: false },
    ],
  },
  {
    id: "g5",
    ficha: "2891301",
    programType: "Tecnólogo",
    programName: "Tecnología en Gestión de Restaurantes",
    instructorName: "Carlos Andrés Martínez",
    vocero: "Santiago Londoño Patiño",
    totalAprendices: 20,
    presentAprendices: 18,
    promedioConsumo: 90,
    apprentices: [
      { id: "e1", name: "Santiago Londoño Patiño", eatsHere: true },
      { id: "e2", name: "Valeria Zapata García", eatsHere: true },
      { id: "e3", name: "Simón Agudelo Rivera", eatsHere: true },
      { id: "e4", name: "Lucía Peña Jiménez", eatsHere: true },
      { id: "e5", name: "Mateo Bedoya Cruz", eatsHere: false },
      { id: "e6", name: "Ana Gómez Botero", eatsHere: true },
    ],
  },
];

function consumptionColor(pct: number) {
  if (pct >= 80) return "#39A900";
  if (pct >= 60) return "#F27C00";
  return "#ef4444";
}

// Subcomponente de edición inline
function InlineEdit({
  value,
  onSave,
  onCancel,
  type = "text",
  min,
  max,
}: {
  value: string;
  onSave: (v: string) => void;
  onCancel: () => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center gap-1">
      <Input
        type={type}
        value={val}
        min={min}
        max={max}
        onChange={(e) => setVal(e.target.value)}
        className="h-8 text-sm rounded-lg w-36"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(val);
          if (e.key === "Escape") onCancel();
        }}
      />
      <Button size="sm" className="h-8 w-8 p-0 rounded-lg text-white" style={{ backgroundColor: "#39A900" }} onClick={() => onSave(val)}>
        <Check className="w-3.5 h-3.5" />
      </Button>
      <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={onCancel}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export default function AdminGroupsView() {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"todos" | ProgramType>("todos");

  // Estado de edición por grupo
  const [editingPresent, setEditingPresent] = useState<string | null>(null);
  const [editingVocero, setEditingVocero] = useState<string | null>(null);

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const handleSavePresent = (groupId: string, raw: string) => {
    const group = groups.find((g) => g.id === groupId)!;
    const val = parseInt(raw, 10);
    if (isNaN(val) || val < 0 || val > group.totalAprendices) {
      toast.error(`El número de presentes debe ser entre 0 y ${group.totalAprendices}`);
      return;
    }
    const newPct = Math.round((val / group.totalAprendices) * 100);
    updateGroup(groupId, { presentAprendices: val, promedioConsumo: newPct });
    setEditingPresent(null);
    toast.success("Asistencia actualizada", {
      description: `${val} de ${group.totalAprendices} aprendices presentes (${newPct}%)`,
    });
  };

  const handleSaveVocero = (groupId: string, raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) { toast.error("El nombre del vocero no puede estar vacío"); return; }
    updateGroup(groupId, { vocero: trimmed });
    setEditingVocero(null);
    toast.success("Vocero actualizado", { description: trimmed });
  };

  const totalGroups = groups.length;
  const totalAprendices = groups.reduce((s, g) => s + g.totalAprendices, 0);
  const totalPresentes = groups.reduce((s, g) => s + g.presentAprendices, 0);
  const avgConsumption = Math.round(groups.reduce((s, g) => s + g.promedioConsumo, 0) / groups.length);

  const filtered = groups.filter((g) => {
    const matchSearch =
      g.ficha.includes(search) ||
      g.programName.toLowerCase().includes(search.toLowerCase()) ||
      g.instructorName.toLowerCase().includes(search.toLowerCase()) ||
      g.vocero.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "todos" || g.programType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Resumen global */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4" style={{ color: "#39A900" }} />
              <p className="text-xs text-gray-500">Total Grupos</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#39A900" }}>{totalGroups}</p>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-sara-green" />
              <p className="text-xs text-gray-500">Total Aprendices</p>
            </div>
            <p className="text-3xl font-extrabold text-sara-green-dark">{totalAprendices}</p>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: "#F27C00" }} />
              <p className="text-xs text-gray-500">Promedio Consumo</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#F27C00" }}>{avgConsumption}%</p>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <UtensilsCrossed className="w-4 h-4 text-sara-orange" />
              <p className="text-xs text-gray-500">Presentes hoy</p>
            </div>
            <p className="text-3xl font-extrabold text-sara-orange-dark">{totalPresentes}</p>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por ficha, programa, instructor o vocero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "Tecnólogo", "Técnico"] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: filterType === t ? "#39A900" : "#f3f4f6",
                color: filterType === t ? "white" : "#6b7280",
              }}>
              {t === "todos" ? "Todos" : t === "Tecnólogo" ? "Tecnólogos" : "Técnicos"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filtered.map((group) => {
          const isExp = expanded === group.id;
          const color = consumptionColor(group.promedioConsumo);
          const isTecnologo = group.programType === "Tecnólogo";
          const doesntEat = group.totalAprendices - group.presentAprendices;
          const sampleEat = group.apprentices.filter((a) => a.eatsHere).length;
          const sampleNot = group.apprentices.filter((a) => !a.eatsHere).length;

          return (
            <Card key={group.id} className="border-0 hover: transition-shadow overflow-hidden">
              <CardContent className="pt-0 pb-0">
                {/* Header */}
                <div className="flex items-center gap-4 py-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: isTecnologo ? "#39A900" : "#F27C00" }}
                  >
                    {isTecnologo ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="text-xs" style={{ backgroundColor: isTecnologo ? "#39A900" : "#F27C00", color: "white" }}>
                        {group.programType}
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono">Ficha {group.ficha}</span>
                    </div>
                    <p className="font-semibold text-gray-800 mt-0.5 truncate">{group.programName}</p>
                    <p className="text-xs text-gray-500 truncate">{group.instructorName}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-center min-w-[56px]">
                      <p className="text-xl font-extrabold text-sara-green-dark">{group.totalAprendices}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-center min-w-[48px]">
                      <p className="text-xl font-extrabold" style={{ color }}>{group.promedioConsumo}%</p>
                      <p className="text-xs text-gray-400">Asist.</p>
                    </div>
                    <button
                      onClick={() => setExpanded(isExp ? null : group.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {isExp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Barra */}
                <div className="pb-3">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${group.promedioConsumo}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {group.presentAprendices} presentes de {group.totalAprendices}
                    </span>
                    <span className="text-xs font-semibold" style={{ color }}>{group.promedioConsumo}%</span>
                  </div>
                </div>

                {/* Detalle */}
                {isExp && (
                  <div className="border-t border-gray-100 pt-4 pb-4 space-y-5">
                    {/* Edición de presentes y vocero */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Presentes */}
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <p className="text-sm font-semibold text-green-800">Asistencia</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white rounded-xl p-2">
                            <p className="text-xl font-extrabold" style={{ color: "#39A900" }}>{group.presentAprendices}</p>
                            <p className="text-xs text-gray-500">Comen aquí</p>
                          </div>
                          <div className="bg-white rounded-xl p-2">
                            <p className="text-xl font-extrabold text-red-500">{doesntEat}</p>
                            <p className="text-xs text-gray-500">No comen</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-500 mb-2">Editar aprendices presentes:</p>
                          {editingPresent === group.id ? (
                            <InlineEdit
                              value={String(group.presentAprendices)}
                              type="number"
                              min={0}
                              max={group.totalAprendices}
                              onSave={(v) => handleSavePresent(group.id, v)}
                              onCancel={() => setEditingPresent(null)}
                            />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs rounded-xl border-green-300 text-green-700"
                              onClick={() => setEditingPresent(group.id)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Cambiar número
                            </Button>
                          )}
                          <p className="text-xs text-gray-400 mt-1.5">
                            Total del grupo: {group.totalAprendices} aprendices
                          </p>
                        </div>
                      </div>

                      {/* Vocero */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <p className="text-sm font-semibold text-yellow-800">Vocero del Grupo</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: isTecnologo ? "#39A900" : "#F27C00" }}>
                            <span className="text-xs font-bold">
                              {group.vocero.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{group.vocero}</p>
                        </div>
                        <div className="pt-2 border-t border-yellow-200">
                          <p className="text-xs text-gray-500 mb-2">Cambiar vocero:</p>
                          {editingVocero === group.id ? (
                            <InlineEdit
                              value={group.vocero}
                              onSave={(v) => handleSaveVocero(group.id, v)}
                              onCancel={() => setEditingVocero(null)}
                            />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs rounded-xl border-yellow-300 text-yellow-700"
                              onClick={() => setEditingVocero(group.id)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Cambiar vocero
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info del grupo */}
                    <div className="bg-sara-green-50 border border-sara-green-100 rounded-2xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-sara-green-dark mb-2">Datos del Grupo</p>
                      {[
                        { label: "Ficha", value: group.ficha, mono: true },
                        { label: "Programa", value: group.programName },
                        { label: "Tipo", value: group.programType },
                        { label: "Instructor", value: group.instructorName },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">{row.label}</span>
                          <span className={`font-medium text-right ml-4 ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Muestra de aprendices */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Muestra ({group.apprentices.length} de {group.totalAprendices})
                        <span className="ml-2 text-gray-400 font-normal">
                          {sampleEat} comen · {sampleNot} no
                        </span>
                      </p>
                      <div className="grid sm:grid-cols-2 gap-1.5">
                        {group.apprentices.map((ap) => (
                          <div
                            key={ap.id}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                              ap.eatsHere ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            <span className="text-gray-700">{ap.name}</span>
                            {ap.eatsHere ? (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <UserCheck className="w-3.5 h-3.5" /> Come
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-500 font-medium">
                                <UserX className="w-3.5 h-3.5" /> No
                              </span>
                            )}
                          </div>
                        ))}
                        {group.totalAprendices > group.apprentices.length && (
                          <p className="text-xs text-center text-gray-400 pt-1 col-span-2">
                            +{group.totalAprendices - group.apprentices.length} más...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron grupos</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
