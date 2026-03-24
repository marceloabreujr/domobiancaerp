import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  FileText,
  Calendar,
  Coffee,
  Sparkles,
} from "lucide-react";

import RHPage from "./RHPage";
import DocumentosPage from "./DocumentosPage";
import CalendarioPage from "./CalendarioPage";
import RotinasPage from "./RotinasPage";
import IAPage from "./IAPage";

const tabs = [
  { id: "rh", label: "RH e Equipes", icon: Users },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "rotinas", label: "Rotinas", icon: Coffee },
  { id: "ia", label: "IA", icon: Sparkles },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("rh");

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            RH, documentos, calendário, rotinas e inteligência artificial.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "rh" && <RHPage />}
        {activeTab === "documentos" && <DocumentosPage />}
        {activeTab === "calendario" && <CalendarioPage />}
        {activeTab === "rotinas" && <RotinasPage />}
        {activeTab === "ia" && <IAPage />}
      </div>
    </DashboardLayout>
  );
}
