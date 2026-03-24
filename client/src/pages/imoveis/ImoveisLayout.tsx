import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Building2, Plus, List, Key, ShoppingBag, Archive, CalendarCheck, Bell, BarChart3, Users, UserCheck, ListTodo, Home, Tag } from "lucide-react";
import TodosPage from "./TodosPage";
import ImoveisListPage from "./ImoveisListPage";
import NovoImovelPage from "./NovoImovelPage";
import ChecklistPage from "./ChecklistPage";
import AlertasCobrancaPage from "./AlertasCobrancaPage";
import ResumoFinanceiroPage from "./ResumoFinanceiroPage";
import ClientesPage from "./ClientesPage";
import ProprietariosPage from "./ProprietariosPage";

type Section =
  | "todos_imoveis"
  | "novo_locacao"
  | "novo_venda"
  | "disponiveis_locacao"
  | "disponiveis_venda"
  | "alugados"
  | "vendidos"
  | "arquivados"
  | "checklist"
  | "alertas"
  | "resumo"
  | "clientes"
  | "proprietarios"
  | "todo_list";

const navItems: Array<{ id: Section; label: string; icon: any; highlight?: boolean }> = [
  { id: "novo_locacao", label: "Novo Locação", icon: Plus, highlight: true },
  { id: "novo_venda", label: "Novo Venda", icon: Tag, highlight: true },
  { id: "todos_imoveis", label: "Todos", icon: List },
  { id: "disponiveis_locacao", label: "Disp. Locação", icon: Home },
  { id: "disponiveis_venda", label: "Disp. Venda", icon: ShoppingBag },
  { id: "alugados", label: "Alugados", icon: Key },
  { id: "vendidos", label: "Vendidos", icon: ShoppingBag },
  { id: "arquivados", label: "Arquivados", icon: Archive },
  { id: "checklist", label: "Checklist", icon: CalendarCheck },
  { id: "alertas", label: "Alertas", icon: Bell },
  { id: "resumo", label: "Resumo", icon: BarChart3 },
  { id: "todo_list", label: "To-Do", icon: ListTodo },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "proprietarios", label: "Proprietários", icon: UserCheck },
];

export default function ImoveisLayout() {
  const [activeSection, setActiveSection] = useState<Section>("todos_imoveis");
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case "novo_locacao": return <NovoImovelPage mode="locacao" onSuccess={() => setActiveSection("disponiveis_locacao")} />;
      case "novo_venda": return <NovoImovelPage mode="venda" onSuccess={() => setActiveSection("disponiveis_venda")} />;
      case "todos_imoveis": return <ImoveisListPage statusFilter={undefined} />;
      case "disponiveis_locacao": return <ImoveisListPage statusFilter="disponivel_locacao" />;
      case "disponiveis_venda": return <ImoveisListPage statusFilter="disponivel_venda" />;
      case "alugados": return <ImoveisListPage statusFilter="alugado" />;
      case "vendidos": return <ImoveisListPage statusFilter="vendido" />;
      case "arquivados": return <ImoveisListPage statusFilter="arquivado" />;
      case "checklist": return <ChecklistPage />;
      case "alertas": return <AlertasCobrancaPage />;
      case "resumo": return <ResumoFinanceiroPage />;
      case "clientes": return <ClientesPage />;
      case "proprietarios": return <ProprietariosPage />;
      case "todo_list": return <TodosPage />;
      default: return <ImoveisListPage statusFilter={undefined} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header do módulo */}
        <div className="border-b border-border bg-background px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestão de Imóveis
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
                    : item.highlight
                    ? "border-transparent text-primary/70 hover:text-primary hover:border-primary/30 font-medium"
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
