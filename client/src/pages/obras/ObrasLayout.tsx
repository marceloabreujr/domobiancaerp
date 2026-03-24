import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, HardHat, Plus, List, Archive, FileText, Image, Calendar, Wrench, Ruler } from "lucide-react";
import NovaObraPage from "./NovaObraPage";
import ObrasListPage from "./ObrasListPage";
import NovoRelatorioPage from "./NovoRelatorioPage";
import AdicionarImagemPage from "./AdicionarImagemPage";
import CalendarioObrasPage from "./CalendarioObrasPage";
import EmpreiteirosPage from "./EmpreiteirosPage";
import ArquitetasPage from "./ArquitetasPage";

type Section =
  | "nova_obra"
  | "em_andamento"
  | "arquivadas"
  | "novo_relatorio"
  | "adicionar_imagem"
  | "calendario"
  | "empreiteiros"
  | "arquitetas";

const navItems: Array<{ id: Section; label: string; icon: any; highlight?: boolean }> = [
  { id: "nova_obra", label: "Nova Obra", icon: Plus, highlight: true },
  { id: "em_andamento", label: "Em Andamento", icon: List },
  { id: "arquivadas", label: "Arquivadas", icon: Archive },
  { id: "novo_relatorio", label: "Relatório", icon: FileText },
  { id: "adicionar_imagem", label: "Imagens", icon: Image },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "empreiteiros", label: "Empreiteiros", icon: Wrench },
  { id: "arquitetas", label: "Arquitetas", icon: Ruler },
];

export default function ObrasLayout() {
  const [activeSection, setActiveSection] = useState<Section>("em_andamento");
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
      case "nova_obra": return <NovaObraPage onSuccess={() => setActiveSection("em_andamento")} />;
      case "em_andamento": return <ObrasListPage archived={false} />;
      case "arquivadas": return <ObrasListPage archived={true} />;
      case "novo_relatorio": return <NovoRelatorioPage />;
      case "adicionar_imagem": return <AdicionarImagemPage />;
      case "calendario": return <CalendarioObrasPage />;
      case "empreiteiros": return <EmpreiteirosPage />;
      case "arquitetas": return <ArquitetasPage />;
      default: return <ObrasListPage archived={false} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header do módulo */}
        <div className="border-b border-border bg-background px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <HardHat className="h-5 w-5" />
            Gestão de Obras
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
