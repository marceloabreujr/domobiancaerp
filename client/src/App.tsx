import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Cada página é carregada sob demanda (code splitting) — o navegador só
// baixa o código do módulo quando ele é aberto.
const Home = lazy(() => import("./pages/Home"));
const Calendario = lazy(() => import("./pages/Calendario"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const ObrasLayout = lazy(() => import("./pages/obras/ObrasLayout"));
const ImoveisLayout = lazy(() => import("./pages/imoveis/ImoveisLayout"));
const NegociosLayout = lazy(() => import("./pages/negocios/NegociosLayout"));
const ProcessosLayout = lazy(() => import("./pages/processos/ProcessosLayout"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const AdmErp = lazy(() => import("./pages/AdmErp"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/calendario" component={Calendario} />
      <Route path="/financeiro" component={Financeiro} />
      <Route path="/administrativo" component={AdminLayout} />
      <Route path="/obras" component={ObrasLayout} />
      <Route path="/imoveis" component={ImoveisLayout} />
      <Route path="/negocios/:rest*" component={NegociosLayout} />
      <Route path="/negocios" component={NegociosLayout} />
      <Route path="/processos" component={ProcessosLayout} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route path="/adm-erp" component={AdmErp} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
