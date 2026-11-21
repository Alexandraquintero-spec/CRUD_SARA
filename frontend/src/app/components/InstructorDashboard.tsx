import { useState } from "react";
import { User } from "../types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  LogOut,
  Calendar,
  History,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import Brand from "./Brand";
import bgPattern from "../../imports/background-pattern.svg";
import MenuView from "./student/MenuView";
import LunchHistoryView, { LunchRecord } from "./student/LunchHistoryView";
import SuggestionsView from "./student/SuggestionsView";
import InstructorLunchCredit from "./instructor/InstructorLunchCredit";

interface InstructorDashboardProps {
  user: User;
  onLogout: () => void;
}

const INITIAL_HISTORY: LunchRecord[] = [
  {
    id: "ih-001",
    date: "2024-04-17",
    menu: "Crema de ahuyama · Pollo al horno · Arroz con lentejas · Fruta",
    amount: 5000,
    status: "confirmado",
    time: "07:30",
  },
  {
    id: "ih-002",
    date: "2024-04-16",
    menu: "Ajiaco · Carne asada · Plátano · Postre",
    amount: 5000,
    status: "confirmado",
    time: "08:05",
  },
];

export default function InstructorDashboard({ user, onLogout }: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState("menu");
  const [lunchHistory] = useState<LunchRecord[]>(INITIAL_HISTORY);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#F6F8F3" }}>
      {/* Fondo decorativo */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          opacity: 0.04,
        }}
      />
      {/* ── HEADER ── */}
      <header className="relative overflow-hidden text-white" style={{ background: "linear-gradient(120deg, #B35A00 0%, #DB6E00 55%, #F27C00 100%)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute right-40 -bottom-20 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brand size="sm" tone="dark" subtitle="Instructor" />
            </div>
            <div className="flex items-center gap-3">
              <Badge className="text-xs hidden sm:flex bg-white/15 text-white border border-white/25">
                Instructor
              </Badge>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="text-xs bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>

          <div className="pt-6 pb-12">
            <h1 className="text-3xl font-extrabold tracking-tight">{`Hola, ${user.name.split(" ")[0]}`}</h1>
            <p className="text-sm text-white/80 mt-1">Registra tus consumos y revisa tu cuenta institucional</p>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 pb-8 -mt-7 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex bg-white shadow-lg shadow-black/5 h-12">
              <TabsTrigger value="menu" className="gap-2 text-xs sm:text-sm">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Menú del día</span>
                <span className="sm:hidden">Menú</span>
              </TabsTrigger>
              <TabsTrigger value="historial" className="gap-2 text-xs sm:text-sm">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Historial</span>
                <span className="sm:hidden">Hist.</span>
                {lunchHistory.length > 0 && (
                  <Badge className="ml-1 text-xs px-1.5 py-0" style={{ backgroundColor: "#39A900", color: "white" }}>
                    {lunchHistory.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="credito" className="gap-2 text-xs sm:text-sm">
                <CreditCard className="w-4 h-4" />
                Mi deuda
              </TabsTrigger>
              <TabsTrigger value="quejas" className="gap-2 text-xs sm:text-sm">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Observaciones</span>
                <span className="sm:hidden">Observ.</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="menu">
            <MenuView />
          </TabsContent>

          <TabsContent value="historial">
            <LunchHistoryView
              userIdentifier={user.name}
              records={lunchHistory}
            />
          </TabsContent>

          <TabsContent value="credito">
            <InstructorLunchCredit instructorName={user.name} />
          </TabsContent>

          <TabsContent value="quejas">
            <SuggestionsView
              userId={user.id}
              userName={user.name}
              userRole="instructor"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
