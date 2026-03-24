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

const sidebarItems = [
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
      <div className="flex h-full">
        {/* Sidebar interna */}
        <aside className="w-56 shrink-0 border-r border-border bg-muted/30 p-3 space-y-1 hidden md:block">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
            Gestão de Negócios
          </h3>
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/negocios"
                ? location === "/negocios"
                : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full border-b border-border bg-muted/30 px-3 py-2 overflow-x-auto">
          <div className="flex gap-1">
            {sidebarItems.map((item) => {
              const isActive =
                item.href === "/negocios"
                  ? location === "/negocios"
                  : location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 p-6 overflow-auto">
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
