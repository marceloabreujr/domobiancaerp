import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, Wallet, TrendingUp, TrendingDown, FileSpreadsheet, RefreshCw, BarChart3, Plus } from "lucide-react";
import DashboardFinanceiro from "./financeiro/DashboardFinanceiro";
import ContasReceber from "./financeiro/ContasReceber";
import ContasPagar from "./financeiro/ContasPagar";
import ContasRecorrentes from "./financeiro/ContasRecorrentes";
import ConciliacaoBancaria from "./financeiro/ConciliacaoBancaria";

type Section =
  | "dashboard"
  | "contas_receber"
  | "contas_pagar"
  | "recorrentes"
  | "conciliacao";

const navItems: Array<{ id: Section; label: string; icon: any; highlight?: boolean }> = [
  { id: "dashboard", label: "Painel", icon: BarChart3 },
  { id: "contas_receber", label: "Contas a Receber", icon: TrendingUp },
  { id: "contas_pagar", label: "Contas a Pagar", icon: TrendingDown },
  { id: "recorrentes", label: "Recorrentes", icon: RefreshCw },
  { id: "conciliacao", label: "Conciliação", icon: FileSpreadsheet },
];

export default function Financeiro() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardFinanceiro />;
      case "contas_receber": return <ContasReceber />;
      case "contas_pagar": return <ContasPagar />;
      case "recorrentes": return <ContasRecorrentes />;
      case "conciliacao": return <ConciliacaoBancaria />;
      default: return <DashboardFinanceiro />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header do módulo */}
        <div className="border-b border-border bg-background px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Financeiro
          </h2>
          {/* Navegação por abas */}
          <nav className="flex gap-0.5 overflow-x-auto pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === item.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </DashboardLayout>
  );
}
