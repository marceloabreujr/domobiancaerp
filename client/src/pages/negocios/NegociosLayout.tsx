import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Route, Switch, useLocation, Link } from "wouter";
import { Loader2, Plus, Briefcase, Archive, Calendar, AlertTriangle, Users } from "lucide-react";
import NegociosListPage from "./NegociosListPage";
import NovoNegocioPage from "./NovoNegocioPage";
import CaptadoresPage from "./CaptadoresPage";
import CalendarioTarefasPage from "./CalendarioTarefasPage";
import TarefasUrgentesPage from "./TarefasUrgentesPage";

const navItems = [
  { label: "Novo Negócio", href: "/negocios/novo", icon: Plus },
  { label: "Negócios Ativos", href: "/negocios", icon: Briefcase },
  { label: "Arquivados", href: "/negocios/arquivados", icon: Archive },
  { label: "Calendário de Tarefas", href: "/negocios/calendario", icon: Calendar },
  { label: "Tarefas Urgentes", href: "/negocios/urgentes", icon: AlertTriangle },
  { label: "Captadores", href: "/negocios/captadores", icon: Users },
];

export default function NegociosLayout() {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();

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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header do módulo */}
        <div className="border-b border-border bg-background px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Gestão de Negócios
          </h2>
          {/* Navegação por abas */}
          <nav className="flex gap-1 overflow-x-auto pb-0">
            {navItems.map((item) => {
              const isActive =
                item.href === "/negocios"
                  ? location === "/negocios"
                  : location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Switch>
            <Route path="/negocios/novo" component={NovoNegocioPage} />
            <Route path="/negocios/arquivados">{() => <NegociosListPage archived={true} />}</Route>
            <Route path="/negocios/calendario" component={CalendarioTarefasPage} />
            <Route path="/negocios/urgentes" component={TarefasUrgentesPage} />
            <Route path="/negocios/captadores" component={CaptadoresPage} />
            <Route path="/negocios" component={NegociosListPage} />
          </Switch>
        </main>
      </div>
    </DashboardLayout>
  );
}
