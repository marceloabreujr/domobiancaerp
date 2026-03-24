import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Financeiro from "./pages/Financeiro";
import AdminLayout from "./pages/admin/AdminLayout";
import ObrasLayout from "./pages/obras/ObrasLayout";
import ImoveisLayout from "./pages/imoveis/ImoveisLayout";
import NegociosLayout from "./pages/negocios/NegociosLayout";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/financeiro" component={Financeiro} />
      <Route path="/administrativo" component={AdminLayout} />
      <Route path="/obras" component={ObrasLayout} />
      <Route path="/imoveis" component={ImoveisLayout} />
      <Route path="/negocios/:rest*" component={NegociosLayout} />
      <Route path="/negocios" component={NegociosLayout} />
      <Route path="/configuracoes" component={Configuracoes} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
