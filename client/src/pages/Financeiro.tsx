import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, Wallet, TrendingUp, TrendingDown, FileSpreadsheet, RefreshCw, BarChart3, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export interface MonthFilter {
  month: number; // 0-11
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

function getMonthFilter(month: number, year: number): MonthFilter {
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { month, year, startDate, endDate };
}

export default function Financeiro() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const { user, loading, isAuthenticated } = useAuth();

  // Estado do mês/ano selecionado
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthFilter = useMemo(
    () => getMonthFilter(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );

  function goToPreviousMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  function goToNextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  function goToCurrentMonth() {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  }

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

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
      case "dashboard": return <DashboardFinanceiro monthFilter={monthFilter} />;
      case "contas_receber": return <ContasReceber monthFilter={monthFilter} />;
      case "contas_pagar": return <ContasPagar monthFilter={monthFilter} />;
      case "recorrentes": return <ContasRecorrentes />;
      case "conciliacao": return <ConciliacaoBancaria />;
      default: return <DashboardFinanceiro monthFilter={monthFilter} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header do módulo */}
        <div className="border-b border-border bg-background px-4 pt-4 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Financeiro
            </h2>

            {/* Seletor de Mês */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-1 py-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                onClick={goToCurrentMonth}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors min-w-[140px] text-center ${
                  isCurrentMonth
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs ml-1"
                  onClick={goToCurrentMonth}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Hoje
                </Button>
              )}
            </div>
          </div>

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
