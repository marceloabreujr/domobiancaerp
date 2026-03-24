import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Building2, Plus, List, CheckCircle, Key, ShoppingBag, Archive, CalendarCheck, Bell, BarChart3, Users, UserCheck, ListTodo } from "lucide-react";
import TodosPage from "./TodosPage";
import ImoveisListPage from "./ImoveisListPage";
import NovoImovelPage from "./NovoImovelPage";
import ChecklistPage from "./ChecklistPage";
import AlertasCobrancaPage from "./AlertasCobrancaPage";
import ResumoFinanceiroPage from "./ResumoFinanceiroPage";
import ClientesPage from "./ClientesPage";
import ProprietariosPage from "./ProprietariosPage";

type Section = "todos_imoveis" | "novo_imovel" | "disponiveis" | "alugados" | "a_venda" | "arquivados" | "checklist" | "alertas" | "resumo" | "clientes" | "proprietarios" | "todo_list";

const sidebarItems: Array<{ id: Section; label: string; icon: any; separator?: boolean }> = [
  { id: "novo_imovel", label: "Novo Imóvel", icon: Plus },
  { id: "todos_imoveis", label: "Todos", icon: List },
  { id: "disponiveis", label: "Disponíveis", icon: CheckCircle },
  { id: "alugados", label: "Alugados", icon: Key },
  { id: "a_venda", label: "À Venda", icon: ShoppingBag },
  { id: "arquivados", label: "Arquivados", icon: Archive },
  { id: "checklist", label: "Checklist Mensal", icon: CalendarCheck, separator: true },
  { id: "alertas", label: "Alertas de Cobrança", icon: Bell },
  { id: "resumo", label: "Resumo Financeiro", icon: BarChart3 },
  { id: "todo_list", label: "To-Do List", icon: ListTodo, separator: true },
  { id: "clientes", label: "Clientes", icon: Users, separator: true },
  { id: "proprietarios", label: "Proprietários", icon: UserCheck },
];

export default function ImoveisLayout() {
  const [activeSection, setActiveSection] = useState<Section>("todos_imoveis");
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case "novo_imovel": return <NovoImovelPage onSuccess={() => setActiveSection("todos_imoveis")} />;
      case "todos_imoveis": return <ImoveisListPage statusFilter={undefined} />;
      case "disponiveis": return <ImoveisListPage statusFilter="disponivel" />;
      case "alugados": return <ImoveisListPage statusFilter="alugado" />;
      case "a_venda": return <ImoveisListPage statusFilter="a_venda" />;
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
      <div className="flex h-full">
        {/* Sidebar interna */}
        <div className="w-56 shrink-0 border-r border-border bg-muted/20 overflow-y-auto">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-sm">Gestão de Imóveis</h2>
            </div>
          </div>
          <nav className="p-2 space-y-0.5">
            {sidebarItems.map((item) => (
              <div key={item.id}>
                {item.separator && <div className="my-2 border-t border-border" />}
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
